import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto';
import { UsersService } from 'src/users/users.service';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
	constructor(
		private prismaService: PrismaService,
		private userService: UsersService,
	) {}

	async create(body: CreateProductDto, userId: string) {
		try {
			const user = await this.userService.findUnique(userId);
			const product = await this.prismaService.product.create({
				data: {
					...body,
					user: {
						connect: user,
					},
				},
			});
			delete product.user_id;
			return product;
		} catch (error) {
			throw new BadRequestException('Create product error');
		}
	}

	async update(body: UpdateProductDto, productId: string) {
		const updatedProduct = await this.prismaService.product.update({
			where: {
				id: productId,
			},
			data: {
				...body,
			},
		});
		delete updatedProduct.user_id;
		return updatedProduct;
	}

	async findAll(
		skip: string,
		take: string,
		sort: Prisma.SortOrder,
		search: string,
	) {
		try {
			const productsInput = {
				where: {
					name: {
						contains: search,
						mode: 'insensitive',
					},
				},
				orderBy: {
					price: sort,
				},
			} satisfies Prisma.ProductFindFirstArgs;

			const totalResults =
				await this.prismaService.product.count(productsInput);

			const products = await this.prismaService.product.findMany({
				...productsInput,
				take: Number(take),
				skip: Number(skip),
			});

			const response = {
				data: products,
				total_results: totalResults,
			};
			return response;
		} catch (error) {
			throw new BadRequestException('Find all product error');
		}
	}

	async findUnique(productId: string) {
		const product = await this.prismaService.product.findUnique({
			where: {
				id: productId,
			},
		});

		delete product.user_id;
		return product;
	}

	async delete(productId: string) {
		await this.prismaService.product.delete({
			where: {
				id: productId,
			},
		});
		return {
			message: 'Product removed successfully',
		};
	}
}
