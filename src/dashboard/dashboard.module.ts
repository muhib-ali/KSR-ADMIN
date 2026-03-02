import { Module as NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { Order } from "../entities/order.entity";
import { OrderItem } from "../entities/order-item.entity";
import { Customer } from "../entities/customer.entity";
import { Product } from "../entities/product.entity";

@NestModule({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Customer, Product])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
