import { Module as NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WarehousesController } from "./warehouses.controller";
import { WarehousesService } from "./warehouses.service";
import { Warehouse } from "../entities/warehouse.entity";

@NestModule({
  imports: [TypeOrmModule.forFeature([Warehouse])],
  controllers: [WarehousesController],
  providers: [WarehousesService],
  exports: [WarehousesService],
})
export class WarehousesModule {}
