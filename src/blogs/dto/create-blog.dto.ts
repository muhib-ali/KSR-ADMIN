import { IsString, IsOptional, IsNotEmpty, MaxLength, IsBoolean } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty({ message: 'Heading is required' })
  @MaxLength(255, { message: 'Heading must not exceed 255 characters' })
  heading: string;

  @IsString()
  @IsNotEmpty({ message: 'Paragraph is required' })
  paragraph: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Blog image URL must not exceed 500 characters' })
  blog_img?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
