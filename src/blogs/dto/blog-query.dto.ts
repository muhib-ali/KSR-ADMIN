import { IsOptional, IsString, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class BlogQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
 
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sort_by?: 'created_at' | 'updated_at' | 'heading' = 'created_at';

  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC' = 'DESC';
}
