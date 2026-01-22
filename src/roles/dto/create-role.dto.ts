import { IsNotEmpty, IsString, IsUUID, MaxLength, MinLength, IsOptional } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreateRoleDto {
  @ApiProperty({
    description: "Role title",
    example: "Platform Manager",
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiProperty({
    description: "Role type ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsUUID()
  @IsOptional()
  role_type_id?: string;
}
