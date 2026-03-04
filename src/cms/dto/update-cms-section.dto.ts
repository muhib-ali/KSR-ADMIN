import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class UpdateCmsSubSectionDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  subsection_key?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  label?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  section_img_url?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  sort_order?: number;
}

export class UpdateCmsSectionDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: "section_key cannot be empty if provided" })
  @MaxLength(255)
  section_key?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  label?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  section_img_url?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCmsSubSectionDto)
  @IsOptional()
  subsections?: UpdateCmsSubSectionDto[];
}
