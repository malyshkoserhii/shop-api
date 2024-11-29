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
	UseGuards,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto';
import { AtGuard } from 'src/common/guards';
import { GetCurrentUserId } from 'src/common/decorators';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
	constructor(private ordersService: OrdersService) {}

	@UseGuards(AtGuard)
	@Post('create')
	@HttpCode(HttpStatus.CREATED)
	create(@Body() body: CreateOrderDto, @GetCurrentUserId() userId: string) {
		return this.ordersService.create(body, userId);
	}

	@UseGuards(AtGuard)
	@Post('update/:id')
	@HttpCode(HttpStatus.OK)
	update(@Body() body: UpdateOrderDto, @Param('id') orderId: string) {
		return this.ordersService.update(orderId, body);
	}

	@UseGuards(AtGuard)
	@Post('add/:id')
	@HttpCode(HttpStatus.OK)
	addNewProducts(@Param('id') orderId: string, @Body() body: CreateOrderDto) {
		return this.ordersService.addNewProducts(orderId, body);
	}

	@UseGuards(AtGuard)
	@Get('all')
	@HttpCode(HttpStatus.OK)
	findAll(@Query('skip') skip: string, @Query('take') take: string) {
		return this.ordersService.findAll(skip, take);
	}

	@UseGuards(AtGuard)
	@Get('customer-orders')
	@HttpCode(HttpStatus.OK)
	findCustomerOrders(
		@GetCurrentUserId() userId: string,
		@Query('skip') skip: string,
		@Query('take') take: string,
	) {
		return this.ordersService.findCustomerOrders(userId, skip, take);
	}

	@UseGuards(AtGuard)
	@Get(':id')
	@HttpCode(HttpStatus.OK)
	getOrderDetails(
		@Param('id') orderId: string,
		@Query('skip') skip: string,
		@Query('take') take: string,
	) {
		return this.ordersService.getOrderDetails(orderId, skip, take);
	}

	@UseGuards(AtGuard)
	@Delete('delete/:id')
	@HttpCode(HttpStatus.OK)
	delete(@Param('id') orderId: string) {
		return this.ordersService.delete(orderId);
	}
}
