import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { ApproveReviewDto, BulkApproveDto } from './dto/approve-review.dto';
import { ReviewResponseDto, ReviewSummaryDto } from './dto/review-response.dto';
import { ReviewStatus } from '../entities/review-status.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Reviews Management')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('getAll')
  @ApiOperation({
    summary: 'Get all reviews',
    description: 'Retrieve paginated reviews with filtering options. Admin can view all reviews regardless of status. Route is /reviews/getAll to match permission middleware (module/permission).',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination (min: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (min: 1, max: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by review status',
    enum: ['pending', 'approved', 'rejected'],
    example: 'pending',
  })
  @ApiQuery({
    name: 'product_id',
    required: false,
    description: 'Filter by product ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'user_id',
    required: false,
    description: 'Filter by customer ID (UUID format)',
    example: '456e7890-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'rating',
    required: false,
    description: 'Filter by rating (1-5 stars)',
    example: 5,
  })
  @ApiQuery({
    name: 'is_verified_purchase',
    required: false,
    description: 'Filter verified purchase reviews only',
    example: true,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in review comments (max 200 characters)',
    example: 'excellent',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by field',
    enum: ['created_at', 'updated_at', 'rating', 'status', 'reviewed_at'],
    example: 'created_at',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        status: true,
        message: 'Reviews retrieved successfully',
        heading: 'Reviews',
        data: {
          reviews: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              product_id: '456e7890-e89b-12d3-a456-426614174000',
              user_id: '789e0123-e89b-12d3-a456-426614174000',
              order_id: '012e3456-e89b-12d3-a456-426614174000',
              rating: 5,
              comment: 'Excellent product! Highly recommended.',
              status: 'pending',
              is_verified_purchase: true,
              admin_notes: 'Customer is a repeat buyer',
              rejection_reason: null,
              reviewed_by: null,
              created_at: '2024-01-15T10:30:00.000Z',
              updated_at: '2024-01-15T10:30:00.000Z',
              reviewed_at: null,
              product: {
                id: '456e7890-e89b-12d3-a456-426614174000',
                name: 'Premium Headphones',
                sku: 'HEAD-001',
              },
              customer: {
                id: '789e0123-e89b-12d3-a456-426614174000',
                fullname: 'John Doe',
                email: 'john@example.com',
              },
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 150,
            totalPages: 8,
            hasNext: true,
            hasPrev: false,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid parameters',
    schema: {
      example: {
        statusCode: 400,
        status: false,
        message: 'Product ID is required',
        heading: 'Error',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    schema: {
      example: {
        statusCode: 403,
        status: false,
        message: 'Access denied: Insufficient permissions for reviews/getAll',
        heading: 'Error',
        data: null,
      },
    },
  })
  async getReviews(@Query(ValidationPipe) getReviewsDto: GetReviewsDto) {
    return this.reviewsService.getReviews(getReviewsDto);
  }

  @Get('getById/:id')
  @ApiOperation({
    summary: 'Get review by ID',
    description: 'Retrieve detailed information about a specific review including product and customer details. Route is /reviews/getById/:id to match permission middleware.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review retrieved successfully',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async getReviewById(@Param('id') id: string) {
    return this.reviewsService.getReviewById(id);
  }

  @Post('approve/:id')
  @ApiOperation({
    summary: 'Approve or reject a review',
    description: 'Approve or reject a single review. When rejecting, a reason is required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review status updated successfully',
    schema: {
      example: {
        statusCode: 200,
        status: true,
        message: 'Review approved successfully',
        heading: 'Review Management',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          status: 'approved',
          reviewed_by: 'Admin User',
          reviewed_at: '2024-01-15T11:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Review already processed or rejection reason missing',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async approveReview(
    @Param('id') id: string,
    @Body(ValidationPipe) approveReviewDto: ApproveReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.approveReview(id, approveReviewDto, req.user);
  }

  @Post('approve/bulk')
  @ApiOperation({
    summary: 'Bulk approve or reject reviews',
    description: 'Approve or reject multiple reviews at once. Useful for processing pending reviews in bulk.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews processed successfully',
    schema: {
      example: {
        statusCode: 200,
        status: true,
        message: '25 reviews approved successfully',
        heading: 'Review Management',
        data: {
          updated_count: 25,
          review_ids: ['uuid1', 'uuid2', 'uuid3'],
          status: 'approved',
          reviewed_by: 'Admin User',
          reviewed_at: '2024-01-15T11:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Rejection reason required when rejecting',
  })
  @ApiResponse({
    status: 404,
    description: 'No pending reviews found for provided IDs',
  })
  async bulkApproveReviews(
    @Body(ValidationPipe) bulkApproveDto: BulkApproveDto,
    @Request() req,
  ) {
    return this.reviewsService.bulkApproveReviews(bulkApproveDto, req.user);
  }

  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Delete a review',
    description: 'Permanently delete a review. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async deleteReview(@Param('id') id: string, @Request() req) {
    return this.reviewsService.deleteReview(id, req.user);
  }
}
