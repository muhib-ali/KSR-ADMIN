import { ApiProperty } from '@nestjs/swagger';
import { OrderDto } from './order-response.dto';

class PaginationMetaDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNext: boolean;

  @ApiProperty()
  hasPrev: boolean;

  @ApiProperty({ nullable: true })
  nextPage: number | null;

  @ApiProperty({ nullable: true })
  prevPage: number | null;
}

class OrdersListDataDto {
  @ApiProperty({ type: [OrderDto] })
  orders: OrderDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}

export class OrdersListResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  status: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  heading: string;

  @ApiProperty({ type: OrdersListDataDto })
  data: OrdersListDataDto;
}
