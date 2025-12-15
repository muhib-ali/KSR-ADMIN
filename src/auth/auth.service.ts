import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../entities/user.entity";
import { OauthToken } from "../entities/oauth-token.entity";
import { RolePermission } from "../entities/role-permission.entity";
import { Permission } from "../entities/permission.entity";
import { Module } from "../entities/module.entity";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
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
    private configService: AppConfigService
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

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refresh_token);

      // Find token record in database
      const tokenRecord = await this.tokenRepository.findOne({
        where: {
          refresh_token,
          userId: payload.sub,
          revoked: false,
        },
        relations: ["user"],
      });

      if (!tokenRecord) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Check if token is expired
      if (new Date() > tokenRecord.expires_at) {
        throw new UnauthorizedException("Token expired");
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

      // Update token record
      tokenRecord.token = newAccessToken;
      tokenRecord.expires_at = newExpiresAt;
      await this.tokenRepository.save(tokenRecord);

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
    } catch (error) {
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
