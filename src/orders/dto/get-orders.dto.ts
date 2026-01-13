import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class GetOrdersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by order status',
    example: 'pending',
    enum: ['pending', 'accepted', 'rejected'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'accepted', 'rejected'])
  status?: 'pending' | 'accepted' | 'rejected';

  @ApiPropertyOptional({
    description: 'Search by order number or customer details',
    example: 'ORD-1001',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
