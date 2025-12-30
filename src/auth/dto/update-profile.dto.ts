import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateProfileDto {
  @ApiProperty({
    description: "User name",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Current password (required for password change)",
    example: "OldPassword123",
    required: false,
  })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiProperty({
    description: "New password (minimum 6 characters, required if currentPassword is provided)",
    example: "NewPassword123",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  newPassword?: string;
}

