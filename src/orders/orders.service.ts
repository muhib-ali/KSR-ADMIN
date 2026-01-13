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
import { GetOrdersDto } from './dto/get-orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>
  ) {}

  async getAll(getOrdersDto: GetOrdersDto): Promise<PaginatedApiResponse<Order>> {
    const { page = 1, limit = 10, status, search } = getOrdersDto;
    const skip = (page - 1) * limit;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.order_items', 'order_items')
      .orderBy('order.created_at', 'DESC')
      .skip(skip)
      .take(limit);

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
      'orders',
      'Orders retrieved successfully',
      'Orders'
    );
  }

  async getById(id: string): Promise<ApiResponse<Order>> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['order_items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return ResponseHelper.success(order, 'Order retrieved successfully', 'Orders', 200);
  }

  async accept(id: string): Promise<ApiResponse<Order>> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be accepted');
    }

    await this.orderRepository.update(id, {
      status: OrderStatus.ACCEPTED,
      updated_at: new Date(),
    });

    const updated = await this.orderRepository.findOne({
      where: { id },
      relations: ['order_items'],
    });

    return ResponseHelper.success(updated, 'Order accepted successfully', 'Orders', 200);
  }

  async reject(id: string): Promise<ApiResponse<Order>> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be rejected');
    }

    await this.orderRepository.update(id, {
      status: OrderStatus.REJECTED,
      updated_at: new Date(),
    });

    const updated = await this.orderRepository.findOne({
      where: { id },
      relations: ['order_items'],
    });

    return ResponseHelper.success(updated, 'Order rejected successfully', 'Orders', 200);
  }
}
