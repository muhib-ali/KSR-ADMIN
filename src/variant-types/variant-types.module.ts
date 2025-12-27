import { Module as NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VariantTypesController } from "./variant-types.controller";
import { VariantTypesService } from "./variant-types.service";
import { VariantType } from "../entities/variant-type.entity";
import { Variant } from "../entities/variant.entity";

@NestModule({
  imports: [TypeOrmModule.forFeature([VariantType, Variant])],
  controllers: [VariantTypesController],
  providers: [VariantTypesService],
  exports: [VariantTypesService],
})
export class VariantTypesModule {}
