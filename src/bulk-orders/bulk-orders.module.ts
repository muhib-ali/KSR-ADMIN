import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BulkOrdersController } from './bulk-orders.controller';
import { BulkOrdersService } from './bulk-orders.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  controllers: [BulkOrdersController],
  providers: [BulkOrdersService],
  exports: [BulkOrdersService],
})
export class BulkOrdersModule {}
