import { BadRequestException, Injectable } from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';

import { CreateOrderDto } from 'src/orders/dto';
import { UpdateOrderDto } from 'src/orders/dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class OrderDetailsService {
	constructor(
		private prismaService: PrismaService,
		private productsService: ProductsService,
	) {}

	async create(createOrderBody: CreateOrderDto, order: Order) {
		try {
			const orderDetailsData = createOrderBody.products.map((product) => {
				return {
					order_id: order.id,
					product_id: product.id,
					...product,
				};
			});

			await this.prismaService.orderDetails.createMany({
				data: orderDetailsData,
			});
		} catch (error) {
			console.log('Create OrderDetailsService Error: ', error);
		}
	}

	async update(orderId: string, body: UpdateOrderDto) {
		try {
			const updatedDetails = body.products.map(async (detail) => {
				const result = await this.prismaService.orderDetails.update({
					where: {
						id: detail.order_details_id,
						AND: {
							order_id: orderId,
						},
					},
					data: {
						quantity: detail.quantity,
					},
				});
				return result;
			});
			await Promise.all(updatedDetails);
		} catch (error) {
			throw new Error(error);
		}
	}

	async getOrderDetails(orderId: string, skip: string, take: string) {
		try {
			const whereOptions = {
				where: {
					order_id: orderId,
				},
			};

			const paginationOptions = this.defaultPaginationOptions(skip, take);

			const totalResults = await this.prismaService.orderDetails.count({
				...whereOptions,
			});

			const totalPages = Math.ceil(totalResults / Number(take));

			const orderDetails = await this.prismaService.orderDetails.findMany(
				{
					...whereOptions,
					...paginationOptions,
				},
			);

			const findProducts = orderDetails.map(async (detail) => {
				const product = await this.productsService.findUnique(
					detail.product_id,
				);

				return {
					order_details_id: detail.id,
					product_id: product.id,
					name: product.name,
					description: product.description,
					price_at_purchase: detail.price_at_purchase,
					quantity: detail.quantity,
				};
			});

			const products = await Promise.all(findProducts);

			const response = {
				data: products,
				total_pages: totalPages,
				total_results: totalResults,
			};

			return response;
		} catch (error) {
			console.log('getOrderDetails Error:', error);
		}
	}

	async delete(detailsId: string, orderId: string) {
		const order = await this.findUniqueOrder(orderId);

		if (!order) {
			throw new BadRequestException('Order with such id does not exist');
		}

		if (order.delivery_status || order.payment_status) {
			throw new BadRequestException(
				'You can not remove product from order with updated status',
			);
		}

		const orderDetails = await this.findUniqueDetails(detailsId);

		if (!orderDetails) {
			throw new BadRequestException(
				'Order details with such id does not exist',
			);
		}

		await this.prismaService.orderDetails.delete({
			where: {
				id: detailsId,
			},
		});

		const orderDetailsAfterRemoving =
			await this.prismaService.orderDetails.findMany({
				where: {
					order_id: orderId,
				},
			});

		if (orderDetailsAfterRemoving.length === 0) {
			await this.prismaService.order.delete({
				where: {
					id: orderId,
				},
			});
		}

		const totalAmount =
			order.total_amount -
			orderDetails.quantity * orderDetails.price_at_purchase;

		const updatedOrder = await this.prismaService.order.update({
			where: {
				id: orderId,
			},
			data: {
				...order,
				total_amount: totalAmount,
			},
		});

		return updatedOrder;
	}

	private async findUniqueDetails(detailsId: string) {
		const orderDetails = await this.prismaService.orderDetails.findUnique({
			where: {
				id: detailsId,
			},
		});
		return orderDetails;
	}

	private async findUniqueOrder(orderId: string) {
		const order = await this.prismaService.order.findUnique({
			where: {
				id: orderId,
			},
		});
		return order;
	}

	private defaultPaginationOptions(
		skip: string,
		take: string,
	): Prisma.OrderDetailsFindManyArgs {
		return {
			skip: Number(skip),
			take: Number(take),
		};
	}
}
