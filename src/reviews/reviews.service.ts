import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Review } from '../entities/review.entity';
import { ReviewStatus } from '../entities/review-status.enum';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { ApproveReviewDto, BulkApproveDto } from './dto/approve-review.dto';
import { ReviewResponseDto, ReviewSummaryDto } from './dto/review-response.dto';
import { ResponseHelper } from '../common/helpers/response.helper';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  /**
   * Get all reviews with filtering and pagination
   */
  async getReviews(getReviewsDto: GetReviewsDto): Promise<any> {
    const {
      page = 1,
      limit = 20,
      status,
      product_id,
      user_id,
      rating,
      is_verified_purchase,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = getReviewsDto;

    const skip = (page - 1) * limit;

    // Build query
    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.product', 'product')
      .leftJoinAndSelect('review.customer', 'customer')
      .leftJoinAndSelect('review.order', 'order');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('review.status = :status', { status });
    }

    if (product_id) {
      queryBuilder.andWhere('review.product_id = :product_id', { product_id });
    }

    if (user_id) {
      queryBuilder.andWhere('review.user_id = :user_id', { user_id });
    }

    if (rating) {
      queryBuilder.andWhere('review.rating = :rating', { rating });
    }

    if (is_verified_purchase !== undefined) {
      queryBuilder.andWhere('review.is_verified_purchase = :is_verified_purchase', { 
        is_verified_purchase 
      });
    }

    if (search) {
      queryBuilder.andWhere('review.comment ILIKE :search', { search: `%${search}%` });
    }

    // Apply sorting
    const validSortFields = ['created_at', 'updated_at', 'rating', 'status', 'reviewed_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    
    queryBuilder.orderBy(`review.${sortField}`, sortOrder);

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const [reviews, total] = await queryBuilder.getManyAndCount();

    // Transform to DTOs
    const reviewDtos: ReviewResponseDto[] = reviews.map(review => ({
      id: review.id,
      product_id: review.product_id,
      user_id: review.user_id,
      order_id: review.order_id,
      product: {
        id: review.product?.id || '',
        name: review.product?.title || 'Unknown Product',
        sku: review.product?.sku || '',
      },
      customer: {
        id: review.customer?.id || '',
        fullname: review.customer?.fullname || 'Unknown Customer',
        email: review.customer?.email || '',
      },
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      is_verified_purchase: review.is_verified_purchase,
      admin_notes: review.admin_notes,
      rejection_reason: review.rejection_reason,
      reviewed_by: review.reviewed_by,
      created_at: review.created_at,
      updated_at: review.updated_at,
      reviewed_at: review.reviewed_at,
    }));

    return ResponseHelper.paginated(
      reviewDtos,
      page,
      limit,
      total,
      'reviews',
      'Reviews retrieved successfully',
      'Reviews'
    );
  }

  /**
   * Get review by ID
   */
  async getReviewById(id: string): Promise<any> {
    const review = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.product', 'product')
      .leftJoinAndSelect('review.customer', 'customer')
      .leftJoinAndSelect('review.order', 'order')
      .where('review.id = :id', { id })
      .getOne();

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const reviewDto: ReviewResponseDto = {
      id: review.id,
      product_id: review.product_id,
      user_id: review.user_id,
      order_id: review.order_id,
      product: {
        id: review.product?.id || '',
        name: review.product?.title || 'Unknown Product',
        sku: review.product?.sku || '',
      },
      customer: {
        id: review.customer?.id || '',
        fullname: review.customer?.fullname || 'Unknown Customer',
        email: review.customer?.email || '',
      },
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      is_verified_purchase: review.is_verified_purchase,
      admin_notes: review.admin_notes,
      rejection_reason: review.rejection_reason,
      reviewed_by: review.reviewed_by,
      created_at: review.created_at,
      updated_at: review.updated_at,
      reviewed_at: review.reviewed_at,
    };

    return ResponseHelper.success(
      reviewDto,
      'Review retrieved successfully',
      'Review'
    );
  }

  /**
   * Approve or reject a single review
   */
  async approveReview(id: string, approveReviewDto: ApproveReviewDto, adminUser: any): Promise<any> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.status !== ReviewStatus.PENDING) {
      throw new BadRequestException(`Review is already ${review.status}`);
    }

    const { status, rejection_reason } = approveReviewDto;

    // Update review
    review.status = status;
    review.reviewed_by = adminUser.fullname || adminUser.email;
    review.reviewed_at = new Date();

    if (status === ReviewStatus.REJECTED && !rejection_reason) {
      throw new BadRequestException('Rejection reason is required when rejecting a review');
    }

    if (rejection_reason) {
      review.rejection_reason = rejection_reason;
    }

    await this.reviewRepository.save(review);

    this.logger.log(`Review ${id} ${status} by admin ${adminUser.email}`);

    return ResponseHelper.success(
      {
        id: review.id,
        status: review.status,
        reviewed_by: review.reviewed_by,
        reviewed_at: review.reviewed_at,
        rejection_reason: review.rejection_reason,
      },
      `Review ${status} successfully`,
      'Review Management'
    );
  }

  /**
   * Bulk approve or reject reviews
   */
  async bulkApproveReviews(bulkApproveDto: BulkApproveDto, adminUser: any): Promise<any> {
    const { reviewIds, status, rejection_reason } = bulkApproveDto;

    if (status === ReviewStatus.REJECTED && !rejection_reason) {
      throw new BadRequestException('Rejection reason is required when rejecting reviews');
    }

    // Find all reviews
    const reviews = await this.reviewRepository
      .createQueryBuilder('review')
      .where('review.id IN (:...reviewIds)', { reviewIds })
      .andWhere('review.status = :status', { status: ReviewStatus.PENDING })
      .getMany();

    if (reviews.length === 0) {
      throw new NotFoundException('No pending reviews found for the provided IDs');
    }

    // Update all reviews
    const updatedReviews = reviews.map(review => {
      review.status = status;
      review.reviewed_by = adminUser.fullname || adminUser.email;
      review.reviewed_at = new Date();
      
      if (rejection_reason) {
        review.rejection_reason = rejection_reason;
      }
      
      return review;
    });

    await this.reviewRepository.save(updatedReviews);

    this.logger.log(`Bulk ${status} ${updatedReviews.length} reviews by admin ${adminUser.email}`);

    return ResponseHelper.success(
      {
        updated_count: updatedReviews.length,
        review_ids: updatedReviews.map(r => r.id),
        status,
        reviewed_by: adminUser.fullname || adminUser.email,
        reviewed_at: new Date(),
        rejection_reason: rejection_reason || null,
      },
      `${updatedReviews.length} reviews ${status} successfully`,
      'Review Management'
    );
  }

  /**
   * Get reviews summary statistics
   */
  async getReviewsSummary(): Promise<any> {
    const [
      totalReviews,
      pendingReviews,
      approvedReviews,
      rejectedReviews,
      ratingStats,
      verifiedStats,
    ] = await Promise.all([
      this.reviewRepository.count(),
      this.reviewRepository.count({ where: { status: ReviewStatus.PENDING } }),
      this.reviewRepository.count({ where: { status: ReviewStatus.APPROVED } }),
      this.reviewRepository.count({ where: { status: ReviewStatus.REJECTED } }),
      this.getRatingBreakdown(),
      this.getVerifiedPurchaseStats(),
    ]);

    const summary: ReviewSummaryDto = {
      total_reviews: totalReviews,
      pending_reviews: pendingReviews,
      approved_reviews: approvedReviews,
      rejected_reviews: rejectedReviews,
      average_rating: ratingStats.average,
      rating_breakdown: ratingStats.breakdown,
      verified_purchase_percentage: verifiedStats.percentage,
    };

    return ResponseHelper.success(
      summary,
      'Reviews summary retrieved successfully',
      'Reviews Summary'
    );
  }

  /**
   * Delete a review (admin action)
   */
  async deleteReview(id: string, adminUser: any): Promise<any> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.reviewRepository.remove(review);

    this.logger.log(`Review ${id} deleted by admin ${adminUser.email}`);

    return ResponseHelper.success(
      null,
      'Review deleted successfully',
      'Review Management'
    );
  }

  /**
   * Update admin notes for a review
   */
  async updateAdminNotes(id: string, adminNotes: string, adminUser: any): Promise<any> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.admin_notes = adminNotes;
    review.updated_by = adminUser.fullname || adminUser.email;
    await this.reviewRepository.save(review);

    return ResponseHelper.success(
      {
        id: review.id,
        admin_notes: review.admin_notes,
        updated_by: review.updated_by,
        updated_at: review.updated_at,
      },
      'Admin notes updated successfully',
      'Review Management'
    );
  }

  /**
   * Get rating breakdown statistics
   */
  private async getRatingBreakdown(): Promise<{ average: number; breakdown: any }> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.status = :status', { status: ReviewStatus.APPROVED })
      .groupBy('review.rating')
      .getRawMany();

    const breakdown = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    let totalRating = 0;
    let totalCount = 0;

    result.forEach(item => {
      const rating = item.rating.toString();
      breakdown[rating] = parseInt(item.count);
      totalRating += parseInt(rating) * parseInt(item.count);
      totalCount += parseInt(item.count);
    });

    const average = totalCount > 0 ? totalRating / totalCount : 0;

    return { average, breakdown };
  }

  /**
   * Get verified purchase statistics
   */
  private async getVerifiedPurchaseStats(): Promise<{ percentage: number }> {
    const [verified, total] = await Promise.all([
      this.reviewRepository.count({
        where: { 
          status: ReviewStatus.APPROVED,
          is_verified_purchase: true,
        },
      }),
      this.reviewRepository.count({
        where: { status: ReviewStatus.APPROVED },
      }),
    ]);

    const percentage = total > 0 ? (verified / total) * 100 : 0;

    return { percentage };
  }
}
