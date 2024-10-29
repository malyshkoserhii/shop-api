import { IsString } from 'class-validator';

export class DeleteProductDto {
	@IsString()
	product_id: string;
}
