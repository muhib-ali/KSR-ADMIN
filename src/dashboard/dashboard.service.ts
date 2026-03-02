import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ResponseHelper } from "../common/helpers/response.helper";
import { ApiResponse } from "../common/interfaces/api-response.interface";
import { Customer } from "../entities/customer.entity";
import { Order } from "../entities/order.entity";
import { OrderItem } from "../entities/order-item.entity";
import { Product } from "../entities/product.entity";
import { OrderStatus } from "../entities/order-status.enum";

type DeltaMetric = {
  current: number;
  previous: number;
  delta: number;
  deltaPercent: number;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) {}

  private computeDelta(current: number, previous: number): DeltaMetric {
    const delta = current - previous;
    const deltaPercent = previous === 0 ? (current > 0 ? 100 : 0) : (delta / previous) * 100;
    return { current, previous, delta, deltaPercent: Number(deltaPercent.toFixed(2)) };
  }

  private startOfMonth(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
  }

  private addDaysUTC(d: Date, days: number): Date {
    const next = new Date(d);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  }

  private startOfDayUTC(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  }

  private endOfDayUTC(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
  }

  private enumerateDaysUTC(start: Date, end: Date): string[] {
    const out: string[] = [];
    let cursor = this.startOfDayUTC(start);
    const last = this.startOfDayUTC(end);

    while (cursor <= last) {
      out.push(cursor.toISOString().slice(0, 10));
      cursor = this.addDaysUTC(cursor, 1);
    }

    return out;
  }

  private normalizeDay(raw: any): string {
    if (!raw) return "";
    if (raw instanceof Date) return raw.toISOString().slice(0, 10);
    const s = String(raw);
    // Handles '2026-01-01', '2026-01-01T00:00:00.000Z', and other driver formats
    return s.length >= 10 ? s.slice(0, 10) : s;
  }

  async getOverview(): Promise<ApiResponse<any>> {
    const now = new Date();

    const currentStart = this.startOfMonth(now);
    const currentEnd = now;

    const elapsedDays = Math.max(
      1,
      Math.floor(
        (this.startOfDayUTC(currentEnd).getTime() - this.startOfDayUTC(currentStart).getTime()) /
          (24 * 60 * 60 * 1000)
      ) + 1
    );

    const prevMonthRef = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const previousStart = this.startOfMonth(prevMonthRef);
    const previousEnd = this.endOfDayUTC(this.addDaysUTC(previousStart, elapsedDays - 1));

    const baseOrderWhere = '(order.order_type = :regularType OR order.order_type IS NULL)';

    const [revenueAggCurrent, revenueAggPrevious, ordersAggCurrent, ordersAggPrevious] =
      await Promise.all([
        this.orderRepository
          .createQueryBuilder('order')
          .select('COALESCE(SUM(order.total_amount), 0)', 'sum')
          .where(baseOrderWhere, { regularType: 'regular' })
          .andWhere('order.status = :status', { status: OrderStatus.ACCEPTED })
          .andWhere('order.created_at BETWEEN :from AND :to', { from: currentStart, to: currentEnd })
          .getRawOne(),
        this.orderRepository
          .createQueryBuilder('order')
          .select('COALESCE(SUM(order.total_amount), 0)', 'sum')
          .where(baseOrderWhere, { regularType: 'regular' })
          .andWhere('order.status = :status', { status: OrderStatus.ACCEPTED })
          .andWhere('order.created_at BETWEEN :from AND :to', { from: previousStart, to: previousEnd })
          .getRawOne(),
        this.orderRepository
          .createQueryBuilder('order')
          .select('COUNT(order.id)', 'count')
          .where(baseOrderWhere, { regularType: 'regular' })
          .andWhere('order.status = :status', { status: OrderStatus.ACCEPTED })
          .andWhere('order.created_at BETWEEN :from AND :to', { from: currentStart, to: currentEnd })
          .getRawOne(),
        this.orderRepository
          .createQueryBuilder('order')
          .select('COUNT(order.id)', 'count')
          .where(baseOrderWhere, { regularType: 'regular' })
          .andWhere('order.status = :status', { status: OrderStatus.ACCEPTED })
          .andWhere('order.created_at BETWEEN :from AND :to', { from: previousStart, to: previousEnd })
          .getRawOne(),
      ]);

    const revenueCurrent = Number(revenueAggCurrent?.sum ?? 0);
    const revenuePrevious = Number(revenueAggPrevious?.sum ?? 0);
    const ordersCurrent = Number(ordersAggCurrent?.count ?? 0);
    const ordersPrevious = Number(ordersAggPrevious?.count ?? 0);

    const [customersCurrent, customersPrevious, productsCurrent, productsPrevious] = await Promise.all([
      this.customerRepository
        .createQueryBuilder('customer')
        .select('COUNT(customer.id)', 'count')
        .where('customer.created_at BETWEEN :from AND :to', { from: currentStart, to: currentEnd })
        .getRawOne(),
      this.customerRepository
        .createQueryBuilder('customer')
        .select('COUNT(customer.id)', 'count')
        .where('customer.created_at BETWEEN :from AND :to', { from: previousStart, to: previousEnd })
        .getRawOne(),
      this.productRepository
        .createQueryBuilder('product')
        .select('COUNT(product.id)', 'count')
        .where('product.created_at BETWEEN :from AND :to', { from: currentStart, to: currentEnd })
        .getRawOne(),
      this.productRepository
        .createQueryBuilder('product')
        .select('COUNT(product.id)', 'count')
        .where('product.created_at BETWEEN :from AND :to', { from: previousStart, to: previousEnd })
        .getRawOne(),
    ]);

    const newCustomersCurrent = Number(customersCurrent?.count ?? 0);
    const newCustomersPrevious = Number(customersPrevious?.count ?? 0);

    const newProductsCurrent = Number(productsCurrent?.count ?? 0);
    const newProductsPrevious = Number(productsPrevious?.count ?? 0);

    const days = this.enumerateDaysUTC(currentStart, currentEnd);

    const dateExpr = 'DATE(order.created_at)';
    const [revenueOverviewRaw, statusTrendsRaw] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('order')
        .select(dateExpr, 'day')
        .addSelect('COALESCE(SUM(order.total_amount), 0)', 'revenue')
        .addSelect('COUNT(order.id)', 'orders')
        .where(baseOrderWhere, { regularType: 'regular' })
        .andWhere('order.status = :status', { status: OrderStatus.ACCEPTED })
        .andWhere('order.created_at BETWEEN :from AND :to', { from: currentStart, to: currentEnd })
        .groupBy(dateExpr)
        .orderBy(dateExpr, 'ASC')
        .getRawMany(),
      this.orderRepository
        .createQueryBuilder('order')
        .select(dateExpr, 'day')
        .addSelect('order.status', 'status')
        .addSelect('COUNT(order.id)', 'count')
        .where(baseOrderWhere, { regularType: 'regular' })
        .andWhere('order.created_at BETWEEN :from AND :to', { from: currentStart, to: currentEnd })
        .andWhere('order.status IN (:...statuses)', {
          statuses: [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.REJECTED],
        })
        .groupBy(dateExpr)
        .addGroupBy('order.status')
        .orderBy(dateExpr, 'ASC')
        .getRawMany(),
    ]);

    const revenueByDay = new Map<string, { revenue: number; orders: number }>();
    for (const r of revenueOverviewRaw) {
      const day = this.normalizeDay(r.day);
      revenueByDay.set(day, { revenue: Number(r.revenue ?? 0), orders: Number(r.orders ?? 0) });
    }

    const statusByDay = new Map<string, { pending: number; accepted: number; rejected: number }>();
    for (const d of days) {
      statusByDay.set(d, { pending: 0, accepted: 0, rejected: 0 });
    }
    for (const row of statusTrendsRaw) {
      const day = this.normalizeDay(row.day);
      const status = String(row.status);
      const count = Number(row.count ?? 0);
      const bucket = statusByDay.get(day) ?? { pending: 0, accepted: 0, rejected: 0 };

      if (status === OrderStatus.PENDING) bucket.pending += count;
      if (status === OrderStatus.ACCEPTED) bucket.accepted += count;
      if (status === OrderStatus.REJECTED) bucket.rejected += count;

      statusByDay.set(day, bucket);
    }

    const revenueOverview = days.map((d) => ({
      day: d,
      revenue: revenueByDay.get(d)?.revenue ?? 0,
      orders: revenueByDay.get(d)?.orders ?? 0,
    }));

    const orderStatusTrends = days.map((d) => ({
      day: d,
      pending: statusByDay.get(d)?.pending ?? 0,
      accepted: statusByDay.get(d)?.accepted ?? 0,
      rejected: statusByDay.get(d)?.rejected ?? 0,
    }));

    const [salesByCategoryRaw, topProductsRaw] = await Promise.all([
      this.orderItemRepository
        .createQueryBuilder('oi')
        .innerJoin('oi.order', 'order')
        .innerJoin('oi.product', 'product')
        .innerJoin('product.category', 'category')
        .select('category.id', 'categoryId')
        .addSelect('category.name', 'categoryName')
        .addSelect('COALESCE(SUM(oi.total_price), 0)', 'revenue')
        .addSelect('COALESCE(SUM(oi.quantity), 0)', 'quantity')
        .where(baseOrderWhere, { regularType: 'regular' })
        .andWhere('order.status = :status', { status: OrderStatus.ACCEPTED })
        .andWhere('order.created_at BETWEEN :from AND :to', { from: currentStart, to: currentEnd })
        .groupBy('category.id')
        .addGroupBy('category.name')
        .orderBy('revenue', 'DESC')
        .limit(10)
        .getRawMany(),
      this.orderItemRepository
        .createQueryBuilder('oi')
        .innerJoin('oi.order', 'order')
        .select('oi.product_id', 'productId')
        .addSelect('MAX(oi.product_name)', 'productName')
        .addSelect('COALESCE(SUM(oi.quantity), 0)', 'quantity')
        .addSelect('COALESCE(SUM(oi.total_price), 0)', 'revenue')
        .where(baseOrderWhere, { regularType: 'regular' })
        .andWhere('order.status = :status', { status: OrderStatus.ACCEPTED })
        .andWhere('order.created_at BETWEEN :from AND :to', { from: currentStart, to: currentEnd })
        .groupBy('oi.product_id')
        .orderBy('quantity', 'DESC')
        .limit(10)
        .getRawMany(),
    ]);

    const responseData = {
      period: {
        current: { from: currentStart, to: currentEnd },
        previous: { from: previousStart, to: previousEnd },
      },
      cards: {
        salesUpPercent: this.computeDelta(revenueCurrent, revenuePrevious).deltaPercent,
        revenue: this.computeDelta(revenueCurrent, revenuePrevious),
        orders: this.computeDelta(ordersCurrent, ordersPrevious),
        newCustomers: this.computeDelta(newCustomersCurrent, newCustomersPrevious),
        newProducts: this.computeDelta(newProductsCurrent, newProductsPrevious),
      },
      charts: {
        revenueOverview,
        salesByCategory: salesByCategoryRaw.map((r) => ({
          categoryId: r.categoryId,
          categoryName: r.categoryName,
          revenue: Number(r.revenue ?? 0),
          quantity: Number(r.quantity ?? 0),
        })),
        topProducts: topProductsRaw.map((r) => ({
          productId: r.productId,
          productName: r.productName,
          quantity: Number(r.quantity ?? 0),
          revenue: Number(r.revenue ?? 0),
        })),
        orderStatusTrends,
      },
    };

    return ResponseHelper.success(responseData, "Dashboard overview retrieved successfully", "Dashboard", 200);
  }
}
