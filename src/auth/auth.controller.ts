import {
  Controller,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
  ValidationPipe,
  UnauthorizedException,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  @ApiOperation({ summary: "User login" })
  @ApiResponse({
    status: 200,
    description: "Login successful",
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials",
    schema: {
      example: {
        statusCode: 401,
        status: false,
        message: "Invalid credentials",
        heading: "Authentication",
        data: null,
      },
    },
  })
  @ApiResponse({ status: 429, description: "Too many requests" })
  @ApiBody({ type: LoginDto })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("refresh")
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({
    status: 200,
    description: "Token refreshed successfully",
    schema: {
      example: {
        status: true,
        message: "Token refreshed successfully",
        heading: "Authentication",
        data: {
          token: "new-jwt-access-token",
          expires_at: "2024-01-01T00:15:00.000Z",
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  @ApiResponse({ status: 429, description: "Too many requests" })
  @ApiBody({ type: RefreshDto })
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 refresh attempts per minute (more lenient for legitimate use)
  async refresh(@Body(ValidationPipe) refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto);
  }

  @Post("logout")
  @ApiOperation({ summary: "User logout" })
  @ApiResponse({
    status: 200,
    description: "Logout successful",
    schema: {
      example: {
        status: true,
        message: "Logged out successfully",
        heading: "Authentication",
        data: null,
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiBearerAuth("JWT-auth")
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    const token = req.headers.authorization?.split(" ")[1];
    return this.authService.logout(token);
  }

  @Put("profile")
  @ApiOperation({ summary: "Update user profile - supports partial updates" })
  @ApiResponse({
    status: 200,
    description: "Profile updated successfully",
    schema: {
      example: {
        status: true,
        message: "Profile updated successfully",
        heading: "Profile",
        data: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "John Doe Updated",
          email: "john.doe@example.com",
          role_id: "123e4567-e89b-12d3-a456-426614174000",
          role: {
            id: "123e4567-e89b-12d3-a456-426614174000",
            title: "Admin",
            slug: "admin",
          },
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-02T00:00:00.000Z",
          created_by: null,
          updated_by: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid token or incorrect current password",
    schema: {
      example: {
        statusCode: 401,
        message: "Current password is incorrect",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Current password required for password change or no fields provided",
    schema: {
      examples: {
        noFields: {
          summary: "No fields provided",
          value: {
            statusCode: 400,
            message: "At least one field (name or password) must be provided for update",
          },
        },
        passwordWithoutCurrent: {
          summary: "Password change without current password",
          value: {
            statusCode: 400,
            message: "Current password is required to change password",
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
  })
  @ApiBearerAuth("JWT-auth")
  @UseGuards(JwtAuthGuard)
  @ApiBody({ 
    type: UpdateProfileDto,
    examples: {
      updateName: {
        summary: "Update name only",
        value: {
          name: "John Doe Updated",
        },
      },
      updatePassword: {
        summary: "Update password only",
        value: {
          currentPassword: "OldPassword123",
          newPassword: "NewPassword123",
        },
      },
      updateBoth: {
        summary: "Update both name and password",
        value: {
          name: "John Doe Updated",
          currentPassword: "OldPassword123",
          newPassword: "NewPassword123",
        },
      },
    },
  })
  async updateProfile(
    @Request() req,
    @Body(ValidationPipe) updateProfileDto: UpdateProfileDto
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException("User not authenticated");
    }
    return this.authService.updateProfile(userId, updateProfileDto);
  }
}
