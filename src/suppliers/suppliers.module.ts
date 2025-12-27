import { Module as NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SuppliersController } from "./suppliers.controller";
import { SuppliersService } from "./suppliers.service";
import { Supplier } from "../entities/supplier.entity";

@NestModule({
  imports: [TypeOrmModule.forFeature([Supplier])],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
