import { IsString, IsOptional, IsNotEmpty, MaxLength, IsBoolean } from 'class-validator';

export class UpdateBlogDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Heading cannot be empty if provided' })
  @MaxLength(255, { message: 'Heading must not exceed 255 characters' })
  heading?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Paragraph cannot be empty if provided' })
  paragraph?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Blog image URL must not exceed 500 characters' })
  blog_img?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
