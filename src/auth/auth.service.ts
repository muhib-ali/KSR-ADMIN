import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../entities/user.entity";
import { OauthToken } from "../entities/oauth-token.entity";
import { RolePermission } from "../entities/role-permission.entity";
import { Permission } from "../entities/permission.entity";
import { Module } from "../entities/module.entity";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { CacheService } from "../cache/cache.service";
import { AppConfigService } from "../config/config.service";
import { ResponseHelper } from "../common/helpers/response.helper";
import { ApiResponse } from "../common/interfaces/api-response.interface";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(OauthToken)
    private tokenRepository: Repository<OauthToken>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    private jwtService: JwtService,
    private cacheService: CacheService,
    private configService: AppConfigService,
    @InjectDataSource()
    private dataSource: DataSource
  ) {}

  private async getModulesWithPermissions(roleId: string) {
    // First, get ALL permissions with their modules
    const allPermissions = await this.permissionRepository
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.module", "m")
      .orderBy("m.title", "ASC")
      .addOrderBy("p.title", "ASC")
      .getMany();

    // Then, get role_permissions for this specific role
    const rolePermissions = await this.rolePermissionRepository
      .createQueryBuilder("rp")
      .where("rp.role_id = :roleId", { roleId })
      .getMany();

    // Create a map of role permissions for quick lookup
    const rolePermissionMap = new Map();
    rolePermissions.forEach((rp) => {
      rolePermissionMap.set(rp.permission_id, rp);
    });

    // Group all permissions by module
    const moduleMap = new Map();

    allPermissions.forEach((permission) => {
      const moduleSlug = permission.module.slug;
      const moduleName = permission.module.title;

      if (!moduleMap.has(moduleSlug)) {
        moduleMap.set(moduleSlug, {
          module_name: moduleName,
          module_slug: moduleSlug,
          permissions: [],
        });
      }

      // Check if this permission exists in role_permissions
      const rolePermission = rolePermissionMap.get(permission.id);

      const permissionDetail = {
        permission_name: permission.title,
        is_Show_in_menu: permission.slug === "getAll",
        permission_slug: permission.slug,
        route: `${moduleSlug}/${permission.slug}`,
        is_allowed: rolePermission ? rolePermission.is_allowed : false,
      };

      moduleMap.get(moduleSlug).permissions.push(permissionDetail);
    });

    return Array.from(moduleMap.values());
  }

  async login(loginDto: LoginDto): Promise<ApiResponse<any>> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ["role"],
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Generate tokens
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.jwtAccessExpires,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.jwtRefreshExpires,
    });

    // Calculate expiry date
    const expiresAt = new Date();
    const accessExpiresInMinutes = this.configService.jwtAccessExpiresMinutes;
    expiresAt.setMinutes(expiresAt.getMinutes() + accessExpiresInMinutes);

    // Save token to database
    const tokenRecord = this.tokenRepository.create({
      userId: user.id,
      name: `${user.name} - ${new Date().toISOString()}`,
      token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      revoked: false,
    });

    await this.tokenRepository.save(tokenRecord);

    // Cache token data for faster validation
    const tokenData = {
      userId: user.id,
      expires_at: expiresAt,
      revoked: false,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
    await this.cacheService.cacheTokenData(
      accessToken,
      tokenData,
      accessExpiresInMinutes
    );

    // Fetch modules with permissions for the user's role
    const modulesWithPermisssions = await this.getModulesWithPermissions(
      user.role.id
    );

    this.logger.log(`User logged in successfully: ${user.email}`);

    // Return response
    return ResponseHelper.success(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        modulesWithPermisssions,
      },
      "Login successful",
      "Authentication"
    );
  }

  async refresh(refreshDto: RefreshDto): Promise<ApiResponse<any>> {
    const { refresh_token } = refreshDto;
    const normalizedRefreshToken = String(refresh_token ?? "")
      .trim()
      .replace(/^Bearer\s+/i, "");

    if (!normalizedRefreshToken) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(normalizedRefreshToken);
      const userId = String((payload as any)?.sub ?? "");

      if (!userId) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Use transaction with row-level locking to prevent race conditions
      // This ensures only one refresh request can process at a time for the same refresh token
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Find token record with row-level lock (SELECT FOR UPDATE)
        // This prevents concurrent refresh requests from processing the same token
        // Note: We lock first without join, then load user separately to avoid PostgreSQL error
        let tokenRecord = await queryRunner.manager
          .createQueryBuilder(OauthToken, "token")
          .setLock("pessimistic_write") // Row-level lock
          .where("token.refresh_token = :refreshToken", { refreshToken: normalizedRefreshToken })
          .andWhere("token.userId = :userId", { userId })
          .andWhere("token.revoked = :revoked", { revoked: false })
          .getOne();

        if (!tokenRecord) {
          // Fallback: some clients may send the correct refresh token but the sub might not match
          // due to historical data inconsistencies. Still keep it secure by verifying JWT above.
          const tokenRecordByRefresh = await queryRunner.manager
            .createQueryBuilder(OauthToken, "token")
            .setLock("pessimistic_write") // Row-level lock
            .where("token.refresh_token = :refreshToken", { refreshToken: normalizedRefreshToken })
            .andWhere("token.revoked = :revoked", { revoked: false })
            .getOne();

          if (!tokenRecordByRefresh) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            this.logger.warn(
              `Refresh failed: token record not found for userId=${userId}`
            );
            throw new UnauthorizedException("Invalid refresh token");
          }

          if (String(tokenRecordByRefresh.userId) !== userId) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            this.logger.warn(
              `Refresh failed: token belongs to different user (expected=${userId}, actual=${tokenRecordByRefresh.userId})`
            );
            throw new UnauthorizedException("Invalid refresh token");
          }

          // Use fallback record
          tokenRecord = tokenRecordByRefresh;
        }

        if (!tokenRecord) {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
          throw new UnauthorizedException("Invalid refresh token");
        }

        // Load user relation separately (after locking) to avoid PostgreSQL FOR UPDATE error
        // PostgreSQL doesn't allow FOR UPDATE on nullable side of outer join
        const tokenWithUser = await queryRunner.manager
          .createQueryBuilder(OauthToken, "token")
          .leftJoinAndSelect("token.user", "user")
          .where("token.id = :tokenId", { tokenId: tokenRecord.id })
          .getOne();
        
        if (tokenWithUser && tokenWithUser.user) {
          tokenRecord.user = tokenWithUser.user;
        } else {
          // Fallback: load user directly if relation not loaded
          const user = await queryRunner.manager.findOne(User, { where: { id: tokenRecord.userId } });
          if (!user) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            this.logger.warn(`Refresh failed: user not found for userId=${tokenRecord.userId}`);
            throw new UnauthorizedException("Invalid refresh token");
          }
          tokenRecord.user = user;
        }

        // Note:
        // tokenRecord.expires_at tracks the ACCESS token expiry in this codebase.
        // Refresh token expiry is already enforced by jwtService.verify(refresh_token).

        // Invalidate old access token cache before updating
        if (tokenRecord.token) {
          await this.cacheService.invalidateToken(tokenRecord.token);
        }

        // Generate new access token
        const newPayload = { sub: payload.sub, email: payload.email };
        const newAccessToken = this.jwtService.sign(newPayload, {
          expiresIn: this.configService.jwtAccessExpires,
        });

        // Calculate new expiry date
        const newExpiresAt = new Date();
        const accessExpiresInMinutes = this.configService.jwtAccessExpiresMinutes;
        newExpiresAt.setMinutes(
          newExpiresAt.getMinutes() + accessExpiresInMinutes
        );

        // Update token record within transaction
        tokenRecord.token = newAccessToken;
        tokenRecord.expires_at = newExpiresAt;
        await queryRunner.manager.save(OauthToken, tokenRecord);

        // Commit transaction
        await queryRunner.commitTransaction();
        await queryRunner.release();

        // Update cache with new token
        const tokenData = {
          userId: tokenRecord.userId,
          expires_at: newExpiresAt,
          revoked: false,
          user: tokenRecord.user,
        };
        await this.cacheService.cacheTokenData(
          newAccessToken,
          tokenData,
          accessExpiresInMinutes
        );

        this.logger.log(`Token refreshed for user: ${tokenRecord.user.email}`);

        return ResponseHelper.success(
          {
            token: newAccessToken,
            expires_at: newExpiresAt,
          },
          "Token refreshed successfully",
          "Authentication"
        );
      } catch (innerError) {
        // Rollback transaction on error
        if (queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction();
        }
        await queryRunner.release();
        
        const name = String((innerError as any)?.name ?? "");
        const message = String((innerError as any)?.message ?? "");
        if (name) {
          this.logger.warn(`Refresh error: ${name}${message ? ` - ${message}` : ""}`);
        }
        if (innerError instanceof UnauthorizedException) {
          throw innerError;
        }
        throw new UnauthorizedException("Invalid refresh token");
      }
    } catch (error) {
      const name = String((error as any)?.name ?? "");
      const message = String((error as any)?.message ?? "");
      if (name) {
        this.logger.warn(`Refresh error: ${name}${message ? ` - ${message}` : ""}`);
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(token: string): Promise<ApiResponse<null>> {
    // Find and delete token record
    const tokenRecord = await this.tokenRepository.findOne({
      where: { token },
      relations: ["user"],
    });

    if (tokenRecord) {
      await this.tokenRepository.remove(tokenRecord);
      // Invalidate cache
      await this.cacheService.invalidateToken(token);
      this.logger.log(
        `User logged out: ${tokenRecord.user?.email || "unknown"}`
      );
    }

    return ResponseHelper.success(
      null,
      "Logged out successfully",
      "Authentication"
    );
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto
  ): Promise<ApiResponse<User>> {
    const { name, currentPassword, newPassword } = updateProfileDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["role"],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Update name
    user.name = name;

    // Handle password change if provided
    if (newPassword) {
      if (!currentPassword) {
        throw new BadRequestException("Current password is required to change password");
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException("Current password is incorrect");
      }

      // Hash and set new password
      const saltRounds = 10;
      user.password = await bcrypt.hash(newPassword, saltRounds);
    }

    // Save updated user
    const updatedUser = await this.userRepository.save(user);

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    this.logger.log(`Profile updated for user: ${user.email}`);

    return ResponseHelper.success(
      userWithoutPassword as User,
      "Profile updated successfully",
      "Profile"
    );
  }

  async validateToken(token: string, userId: string): Promise<User | null> {
    try {
      // First check cache for faster validation
      const cachedData = await this.cacheService.getTokenData(token);

      if (cachedData) {
        // Check if cached token is still valid
        if (
          cachedData.userId === userId &&
          !cachedData.revoked &&
          new Date() < new Date(cachedData.expires_at)
        ) {
          return cachedData.user;
        } else {
          // Invalid cached data, remove it
          await this.cacheService.invalidateToken(token);
        }
      }

      // Fallback to database with optimized query
      const tokenRecord = await this.tokenRepository.findOne({
        where: {
          token,
          userId,
          revoked: false,
        },
        select: ["id", "expires_at", "revoked", "userId"],
        relations: ["user", "user.role"],
      });

      if (!tokenRecord) {
        return null;
      }

      // Check if token is expired
      if (new Date() > tokenRecord.expires_at) {
        return null;
      }

      // Cache the valid token data for future requests
      const tokenData = {
        userId: tokenRecord.userId,
        expires_at: tokenRecord.expires_at,
        revoked: tokenRecord.revoked,
        user: tokenRecord.user,
      };

      const remainingMinutes = Math.floor(
        (tokenRecord.expires_at.getTime() - new Date().getTime()) / (1000 * 60)
      );

      if (remainingMinutes > 0) {
        await this.cacheService.cacheTokenData(
          token,
          tokenData,
          remainingMinutes
        );
      }

      return tokenRecord.user;
    } catch (error) {
      this.logger.error(`Token validation error: ${error.message}`);
      return null;
    }
  }
}
