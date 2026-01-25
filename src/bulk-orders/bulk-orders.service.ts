import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseHelper } from '../common/helpers/response.helper';
import {
  ApiResponse,
  PaginatedApiResponse,
} from '../common/interfaces/api-response.interface';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderStatus } from '../entities/order-status.enum';
import { GetBulkOrdersDto } from './dto/get-bulk-orders.dto';

@Injectable()
export class BulkOrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>
  ) {}

  async getAll(getBulkOrdersDto: GetBulkOrdersDto): Promise<PaginatedApiResponse<Order>> {
    const { page = 1, limit = 10, status, search } = getBulkOrdersDto;
    const skip = (page - 1) * limit;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.order_items', 'order_items')
      .leftJoinAndSelect('order.user', 'user')
      .orderBy('order.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    // Filter bulk orders only
    qb.andWhere('order.order_type = :bulkType', { bulkType: 'bulk' });

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      qb.andWhere(
        `(
          order.order_number ILIKE :q OR
          order.first_name ILIKE :q OR
          order.last_name ILIKE :q OR
          order.email ILIKE :q OR
          order.phone ILIKE :q
        )`,
        { q }
      );
    }

    const [orders, total] = await qb.getManyAndCount();

    return ResponseHelper.paginated(
      orders,
      page,
      limit,
      total,
      'bulk-orders',
      'Bulk orders retrieved successfully',
      'Bulk Orders'
    );
  }

  async getById(id: string): Promise<ApiResponse<Order>> {
    const order = await this.orderRepository.findOne({
      where: { id, order_type: 'bulk' },
      relations: ['order_items', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Bulk order not found');
    }

    return ResponseHelper.success(order, 'Bulk order retrieved successfully', 'Bulk Orders', 200);
  }

  async acceptItem(orderId: string, orderItemId: string): Promise<ApiResponse<Order>> {
    // Validate order exists and is bulk
    const order = await this.orderRepository.findOne({
      where: { id: orderId, order_type: 'bulk' },
      relations: ['order_items'],
    });

    if (!order) {
      throw new NotFoundException('Bulk order not found');
    }

    // Validate item belongs to order
    const item = order.order_items.find(i => i.id === orderItemId);
    if (!item) {
      throw new NotFoundException('Order item not found in this order');
    }

    // Validate item is pending
    if (item.item_status !== 'pending') {
      throw new BadRequestException(`Item is already ${item.item_status}`);
    }

    // Update item status
    await this.orderItemRepository.update(orderItemId, {
      item_status: 'accepted',
      updated_at: new Date(),
    });

    // Recompute order status based on all items
    await this.recomputeOrderStatus(orderId);

    // Fetch updated order
    const updatedOrder = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['order_items', 'user'],
    });

    return ResponseHelper.success(
      updatedOrder,
      'Item accepted successfully',
      'Bulk Orders',
      200
    );
  }

  async rejectItem(orderId: string, orderItemId: string): Promise<ApiResponse<Order>> {
    // Validate order exists and is bulk
    const order = await this.orderRepository.findOne({
      where: { id: orderId, order_type: 'bulk' },
      relations: ['order_items'],
    });

    if (!order) {
      throw new NotFoundException('Bulk order not found');
    }

    // Validate item belongs to order
    const item = order.order_items.find(i => i.id === orderItemId);
    if (!item) {
      throw new NotFoundException('Order item not found in this order');
    }

    // Validate item is pending
    if (item.item_status !== 'pending') {
      throw new BadRequestException(`Item is already ${item.item_status}`);
    }

    // Update item status
    await this.orderItemRepository.update(orderItemId, {
      item_status: 'rejected',
      updated_at: new Date(),
    });

    // Recompute order status based on all items
    await this.recomputeOrderStatus(orderId);

    // Fetch updated order
    const updatedOrder = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['order_items', 'user'],
    });

    return ResponseHelper.success(
      updatedOrder,
      'Item rejected successfully',
      'Bulk Orders',
      200
    );
  }

  private async recomputeOrderStatus(orderId: string): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['order_items'],
    });

    if (!order || !order.order_items || order.order_items.length === 0) {
      return;
    }

    const items = order.order_items;
    const acceptedCount = items.filter(i => i.item_status === 'accepted').length;
    const rejectedCount = items.filter(i => i.item_status === 'rejected').length;
    const pendingCount = items.filter(i => i.item_status === 'pending').length;

    let newStatus: OrderStatus;

    if (pendingCount > 0) {
      // If any item is still pending, order remains pending
      newStatus = OrderStatus.PENDING;
    } else if (acceptedCount === items.length) {
      // All accepted
      newStatus = OrderStatus.ACCEPTED;
    } else if (rejectedCount === items.length) {
      // All rejected
      newStatus = OrderStatus.REJECTED;
    } else {
      // Mix of accepted and rejected
      newStatus = 'partially_accepted' as OrderStatus;
    }

    await this.orderRepository.update(orderId, {
      status: newStatus,
      updated_at: new Date(),
    });
  }
}
