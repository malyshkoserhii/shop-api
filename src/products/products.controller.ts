import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Query,
	Response,
	UseGuards,
} from '@nestjs/common';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto';
import { GetCurrentUserId } from 'src/common/decorators';
import { AtGuard } from 'src/common/guards';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
	constructor(private productsService: ProductsService) {}

	@UseGuards(AtGuard)
	@Post('create')
	@HttpCode(HttpStatus.CREATED)
	create(@Body() body: CreateProductDto, @GetCurrentUserId() userId: string) {
		return this.productsService.create(body, userId);
	}

	@UseGuards(AtGuard)
	@Post('update/:id')
	@HttpCode(HttpStatus.OK)
	update(@Body() body: UpdateProductDto, @Param('id') productId: string) {
		return this.productsService.update(body, productId);
	}

	@UseGuards(AtGuard)
	@Get('all')
	@HttpCode(HttpStatus.OK)
	findAll(
		@GetCurrentUserId() userId: string,
		@Query('skip') skip: string,
		@Query('take') take: string,
	) {
		return this.productsService.findAll(userId, skip, take);
	}

	@UseGuards(AtGuard)
	@Get(':id')
	@HttpCode(HttpStatus.OK)
	findUnique(@Param('id') productId: string) {
		return this.productsService.findUnique(productId);
	}

	@UseGuards(AtGuard)
	@Delete('delete/:id')
	@HttpCode(HttpStatus.OK)
	delete(@Param('id') productId: string) {
		return this.productsService.delete(productId);
	}
}
