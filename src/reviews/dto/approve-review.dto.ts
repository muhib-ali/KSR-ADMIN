import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '../../entities/review-status.enum';

export class ApproveReviewDto {
  @ApiProperty({
    description: 'Review status - APPROVED or REJECTED',
    enum: ReviewStatus,
    example: ReviewStatus.APPROVED,
  })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  @ApiPropertyOptional({
    description: 'Admin rejection reason (required when rejecting)',
    example: 'Review contains inappropriate language',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejection_reason?: string;
}

export class BulkApproveDto {
  @ApiProperty({
    description: 'Array of review IDs to approve',
    type: [String],
    example: ['uuid1', 'uuid2', 'uuid3'],
  })
  reviewIds: string[];

  @ApiProperty({
    description: 'Status to apply to all reviews',
    enum: ReviewStatus,
    example: ReviewStatus.APPROVED,
  })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  @ApiPropertyOptional({
    description: 'Common rejection reason (required when rejecting)',
    example: 'Spam content detected',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejection_reason?: string;
}
