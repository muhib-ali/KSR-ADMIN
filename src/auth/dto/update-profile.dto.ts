import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateProfileDto {
  @ApiProperty({
    description: "User name (optional - only provided if updating name)",
    example: "John Doe",
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: "Name cannot be empty if provided" })
  name?: string;

  @ApiProperty({
    description: "Current password (required for password change)",
    example: "OldPassword123",
    required: false,
  })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiProperty({
    description: "New password (minimum 8 characters, required if currentPassword is provided)",
    example: "NewPassword123",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(8, { message: "Password must be greater than 8 characters long" })
  newPassword?: string;
}

