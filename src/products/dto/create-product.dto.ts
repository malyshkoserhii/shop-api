import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
	@IsString()
	name: string;

	@IsString()
	@IsOptional()
	description: string;

	@IsBoolean()
	in_stock: boolean;

	@IsNumber()
	price: number;

	@IsNumber()
	stock_quantity: number;

	@IsString()
	@IsOptional()
	category: string;
}
