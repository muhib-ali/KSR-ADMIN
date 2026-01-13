import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ReviewStatus } from './review-status.enum';
import { Product } from './product.entity';
import { Customer } from './customer.entity';
import { Order } from './order.entity';

@Entity('reviews')
@Index(['product_id', 'status'])
@Index(['user_id'])
@Index(['created_at'])
@Index(['product_id', 'user_id'], { unique: true })
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  product_id: string;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  order_id: string;

  @Column({ type: 'int', nullable: false })
  rating: number;

  @Column({ type: 'text', nullable: false })
  comment: string;

  @Column({
    type: 'varchar',
    default: ReviewStatus.PENDING,
    enum: ReviewStatus,
  })
  status: ReviewStatus;

  @Column({ type: 'boolean', default: false })
  is_verified_purchase: boolean;

  @Column({ type: 'text', nullable: true })
  admin_notes: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @Column({ type: 'varchar', nullable: true })
  reviewed_by: string;

  @Column({ type: 'timestamptz', nullable: true })
  reviewed_at: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', nullable: true })
  created_by: string;

  @Column({ type: 'varchar', nullable: true })
  updated_by: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'user_id' })
  customer: Customer;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
