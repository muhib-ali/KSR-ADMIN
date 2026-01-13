import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { GetOrdersDto } from './dto/get-orders.dto';
import { OrdersListResponseDto } from './dto/orders-list-response.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get('getAll')
  @ApiOperation({ summary: 'Get all orders (with filters)' })
  @ApiResponse({ status: 200, type: OrdersListResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'accepted', 'rejected'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAll(@Query(ValidationPipe) queryDto: GetOrdersDto) {
    return this.ordersService.getAll(queryDto);
  }

  @Get('getById/:id')
  @ApiOperation({ summary: 'Get order by id' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiParam({ name: 'id', description: 'Order ID', type: String })
  async getById(@Param('id') id: string) {
    return this.ordersService.getById(id);
  }

  @Patch('accept/:id')
  @ApiOperation({ summary: 'Accept order (pending -> accepted)' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiParam({ name: 'id', description: 'Order ID', type: String })
  async accept(@Param('id') id: string) {
    return this.ordersService.accept(id);
  }

  @Patch('reject/:id')
  @ApiOperation({ summary: 'Reject order (pending -> rejected)' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiParam({ name: 'id', description: 'Order ID', type: String })
  async reject(@Param('id') id: string) {
    return this.ordersService.reject(id);
  }
}
