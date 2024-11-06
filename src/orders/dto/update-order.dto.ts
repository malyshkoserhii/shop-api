import { IsArray, ValidateNested } from 'class-validator';

import { OrderUnique } from '../types';

export class UpdateOrderDto {
	@IsArray()
	@ValidateNested({ each: true })
	products: Array<OrderUnique>;
}
