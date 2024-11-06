import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { OrderProduct } from '../types';

export class CreateOrderDto {
	@IsArray()
	@ValidateNested({ each: true })
	products: Array<OrderProduct>;

	// @IsNumber()
	// total_amount: number;
}
