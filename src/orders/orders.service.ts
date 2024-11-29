import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CreateOrderDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderDetailsService } from 'src/order-details/order-details.service';
import { UsersService } from 'src/users/users.service';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
	constructor(
		private prismaService: PrismaService,
		private userService: UsersService,
		private orderDetailsService: OrderDetailsService,
	) {}

	async create(body: CreateOrderDto, userId: string) {
		try {
			const user = await this.userService.findUnique(userId);

			// TODO: send total amount from Front End. Put it to CreateOrderDto
			const totalAmount = body.products
				.map((el) => el.price_at_purchase * el.quantity)
				.reduce((acc, el) => (acc += el), 0);

			const order = await this.prismaService.order.create({
				data: {
					total_amount: totalAmount,
					user: {
						connect: user,
					},
				},
			});

			await this.orderDetailsService.create(body, order);

			return {
				message: 'Order created successfully',
			};
		} catch (error) {
			console.log('Create OrdersService Error: ', error);
		}
	}

	async addNewProducts(orderId: string, body: CreateOrderDto) {
		const order = await this.findUnique(orderId);

		if (order?.delivery_status || order?.payment_status) {
			throw new BadRequestException(
				'You can not add product to order with updated status',
			);
		}

		await this.orderDetailsService.create(body, order);

		// TODO: send total amount from Front End. Put it to CreateOrderDto
		const totalAmount = body.products
			.map((el) => el.price_at_purchase * el.quantity)
			.reduce((acc, el) => (acc += el), 0);

		const newTotalAmount = totalAmount + order.total_amount;

		await this.updateTotalAmount(orderId, newTotalAmount);

		return {
			message: 'Products added successfully',
		};
	}

	async update(orderId: string, body: UpdateOrderDto) {
		try {
			const order = await this.findUnique(orderId);

			await this.orderDetailsService.update(orderId, body);

			// TODO: send total amount from Front End. Put it to CreateOrderDto
			const totalAmount = body.products
				.map((el) => el.price_at_purchase * el.quantity)
				.reduce((acc, el) => (acc += el), 0);

			const newTotalAmount = order.total_amount + totalAmount;

			await this.updateTotalAmount(orderId, newTotalAmount);

			return {
				message: 'Order updated successfully',
			};
		} catch (e) {
			console.log('e', e);
		}
	}

	async findAll(skip: string, take: string, email: string) {
		const whereOptions = {
			where: {
				user: {
					email: {
						contains: email,
						mode: 'insensitive',
					},
				},
			},
		} satisfies Prisma.OrderFindManyArgs;

		const paginationOptions = this.defaultPaginationOptions(skip, take);

		const orders = await this.prismaService.order.findMany({
			...whereOptions,
			...paginationOptions,
			include: {
				user: {
					select: {
						email: true,
					},
				},
			},
		});

		const orderData = orders.map((order) => {
			return {
				...order,
				customer: order.user.email,
			};
		});

		const totalResults = await this.prismaService.order.count({
			...whereOptions,
		});

		const totalPages = Math.ceil(totalResults / Number(take));

		const response = {
			data: orderData,
			total_results: totalResults,
			total_pages: totalPages,
		};

		return response;
	}

	async findCustomerOrders(userId: string, skip: string, take: string) {
		const whereOptions = {
			where: {
				user_id: userId,
			},
		};

		const paginationOptions = this.defaultPaginationOptions(skip, take);

		const orders = await this.prismaService.order.findMany({
			...whereOptions,
			...paginationOptions,
		});

		const totalResults = await this.prismaService.order.count();

		const totalPages = Math.ceil(totalResults / Number(take));

		const response = {
			data: orders,
			total_results: totalResults,
			total_pages: totalPages,
		};

		return response;
	}

	async findUnique(orderId: string) {
		const order = await this.prismaService.order.findUnique({
			where: {
				id: orderId,
			},
		});

		return order;
	}

	async getOrderDetails(orderId: string, skip: string, take: string) {
		const order = await this.orderDetailsService.getOrderDetails(
			orderId,
			skip,
			take,
		);
		return order;
	}

	async delete(orderId: string) {
		const order = await this.findUnique(orderId);

		if (order?.delivery_status || order?.payment_status) {
			throw new BadRequestException(
				'You can not remove order with updated status',
			);
		}

		await this.prismaService.order.delete({
			where: {
				id: orderId,
			},
		});

		return {
			message: 'Order deleted',
		};
	}

	private async updateTotalAmount(orderId: string, newTotalAmount: number) {
		await this.prismaService.order.update({
			where: {
				id: orderId,
			},
			data: {
				total_amount: newTotalAmount,
			},
		});
	}

	private defaultPaginationOptions(
		skip: string,
		take: string,
	): Prisma.OrderFindManyArgs {
		return {
			skip: Number(skip),
			take: Number(take),
		};
	}
}
