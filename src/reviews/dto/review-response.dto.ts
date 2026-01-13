import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus } from '../../entities/review-status.enum';

export class ReviewResponseDto {
  @ApiProperty({
    description: 'Review ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Product ID',
    example: '456e7890-e89b-12d3-a456-426614174000',
  })
  product_id: string;

  @ApiProperty({
    description: 'Customer ID',
    example: '789e0123-e89b-12d3-a456-426614174000',
  })
  user_id: string;

  @ApiProperty({
    description: 'Order ID (if applicable)',
    example: '012e3456-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  order_id: string | null;

  @ApiProperty({
    description: 'Product information',
    type: 'object',
    example: {
      id: '456e7890-e89b-12d3-a456-426614174000',
      name: 'Premium Headphones',
      sku: 'HEAD-001',
    },
  })
  product: {
    id: string;
    name: string;
    sku: string;
  };

  @ApiProperty({
    description: 'Customer information',
    type: 'object',
    example: {
      id: '789e0123-e89b-12d3-a456-426614174000',
      fullname: 'John Doe',
      email: 'john@example.com',
    },
  })
  customer: {
    id: string;
    fullname: string;
    email: string;
  };

  @ApiProperty({
    description: 'Rating (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  rating: number;

  @ApiProperty({
    description: 'Review comment',
    example: 'Excellent product! Highly recommended.',
  })
  comment: string;

  @ApiProperty({
    description: 'Review status',
    enum: ReviewStatus,
    example: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @ApiProperty({
    description: 'Whether this is a verified purchase',
    example: true,
  })
  is_verified_purchase: boolean;

  @ApiProperty({
    description: 'Admin notes for internal use',
    example: 'Customer is a repeat buyer',
    nullable: true,
  })
  admin_notes: string | null;

  @ApiProperty({
    description: 'Rejection reason (if rejected)',
    example: 'Contains inappropriate language',
    nullable: true,
  })
  rejection_reason: string | null;

  @ApiProperty({
    description: 'Admin who reviewed this',
    example: 'Admin User',
    nullable: true,
  })
  reviewed_by: string | null;

  @ApiProperty({
    description: 'Review timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2024-01-15T11:00:00.000Z',
  })
  updated_at: Date;

  @ApiProperty({
    description: 'Review action timestamp',
    example: '2024-01-15T11:00:00.000Z',
    nullable: true,
  })
  reviewed_at: Date | null;
}

export class ReviewSummaryDto {
  @ApiProperty({
    description: 'Total number of reviews',
    example: 150,
  })
  total_reviews: number;

  @ApiProperty({
    description: 'Number of pending reviews',
    example: 12,
  })
  pending_reviews: number;

  @ApiProperty({
    description: 'Number of approved reviews',
    example: 135,
  })
  approved_reviews: number;

  @ApiProperty({
    description: 'Number of rejected reviews',
    example: 3,
  })
  rejected_reviews: number;

  @ApiProperty({
    description: 'Average rating',
    example: 4.5,
    minimum: 1,
    maximum: 5,
  })
  average_rating: number;

  @ApiProperty({
    description: 'Rating breakdown',
    type: 'object',
    example: {
      '5': 80,
      '4': 35,
      '3': 25,
      '2': 8,
      '1': 2,
    },
  })
  rating_breakdown: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };

  @ApiProperty({
    description: 'Verified purchase percentage',
    example: 85.5,
  })
  verified_purchase_percentage: number;
}
