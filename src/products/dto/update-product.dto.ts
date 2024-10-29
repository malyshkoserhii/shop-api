import {
	IsString,
	IsOptional,
	IsNumber,
	IsBoolean,
	IsUUID,
} from 'class-validator';

export class UpdateProductDto {
	@IsString()
	@IsOptional()
	name: string;

	@IsString()
	@IsOptional()
	description: string;

	@IsNumber()
	@IsOptional()
	price: number;

	@IsBoolean()
	@IsOptional()
	in_stock: boolean;

	@IsNumber()
	@IsOptional()
	stock_quantity: number;

	@IsString()
	@IsOptional()
	category: string;
}
