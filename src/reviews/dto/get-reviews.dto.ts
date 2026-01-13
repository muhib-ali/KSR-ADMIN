import { IsOptional, IsInt, Min, Max, IsEnum, IsUUID, IsBoolean, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '../../entities/review-status.enum';

export class GetReviewsDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page (max 100)',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by review status',
    enum: ReviewStatus,
    example: ReviewStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @ApiPropertyOptional({
    description: 'Filter by product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  product_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by customer ID',
    example: '456e7890-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by rating (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Filter verified purchase reviews only',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_verified_purchase?: boolean;

  @ApiPropertyOptional({
    description: 'Search in review comments',
    example: 'excellent',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'created_at',
  })
  @IsOptional()
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
  })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
