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

export class CreateCmsSubSectionDto {
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

export class CreateCmsSectionDto {
  @IsString()
  @IsNotEmpty({ message: "section_key is required" })
  @MaxLength(255)
  section_key: string;

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
  @Type(() => CreateCmsSubSectionDto)
  @IsOptional()
  subsections?: CreateCmsSubSectionDto[];
}
