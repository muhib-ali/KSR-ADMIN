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
import { BulkOrdersService } from './bulk-orders.service';
import { GetBulkOrdersDto } from './dto/get-bulk-orders.dto';

@ApiTags('Bulk Orders')
@ApiBearerAuth('JWT-auth')
@Controller('bulk-orders')
export class BulkOrdersController {
  constructor(private bulkOrdersService: BulkOrdersService) {}

  @Get('getAll')
  @ApiOperation({ summary: 'Get all bulk orders with items' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'accepted', 'rejected', 'partially_accepted'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAll(@Query(ValidationPipe) queryDto: GetBulkOrdersDto) {
    return this.bulkOrdersService.getAll(queryDto);
  }

  @Get('getById/:id')
  @ApiOperation({ summary: 'Get bulk order by id with items' })
  @ApiParam({ name: 'id', description: 'Order ID', type: String })
  async getById(@Param('id') id: string) {
    return this.bulkOrdersService.getById(id);
  }

  @Patch(':orderId/items/:orderItemId/accept')
  @ApiOperation({ summary: 'Accept a bulk order item' })
  @ApiParam({ name: 'orderId', description: 'Order ID', type: String })
  @ApiParam({ name: 'orderItemId', description: 'Order Item ID', type: String })
  async acceptItem(
    @Param('orderId') orderId: string,
    @Param('orderItemId') orderItemId: string,
  ) {
    return this.bulkOrdersService.acceptItem(orderId, orderItemId);
  }

  @Patch(':orderId/items/:orderItemId/reject')
  @ApiOperation({ summary: 'Reject a bulk order item' })
  @ApiParam({ name: 'orderId', description: 'Order ID', type: String })
  @ApiParam({ name: 'orderItemId', description: 'Order Item ID', type: String })
  async rejectItem(
    @Param('orderId') orderId: string,
    @Param('orderItemId') orderItemId: string,
  ) {
    return this.bulkOrdersService.rejectItem(orderId, orderItemId);
  }
}
