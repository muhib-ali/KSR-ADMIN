import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order_id: string;

  @ApiProperty()
  product_id: string;

  @ApiProperty()
  product_name: string;

  @ApiProperty({ required: false, nullable: true })
  product_sku: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unit_price: number;

  @ApiProperty()
  total_price: number;
}

export class OrderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order_number: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false, nullable: true })
  phone: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  zip_code: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  subtotal_amount: number;

  @ApiProperty()
  discount_amount: number;

  @ApiProperty()
  total_amount: number;

  @ApiProperty({ required: false, nullable: true })
  promo_code_id: string;

  @ApiProperty({ enum: ['pending', 'accepted', 'rejected'] })
  status: string;

  @ApiProperty({ required: false, nullable: true })
  notes: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ type: [OrderItemDto] })
  order_items: OrderItemDto[];
}

export class OrderResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  status: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  heading: string;

  @ApiProperty({ type: OrderDto })
  data: OrderDto;
}
