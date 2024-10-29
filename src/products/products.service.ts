import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto';
import { UsersService } from 'src/users/users.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';

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
			return product;
		} catch (error) {
			throw new BadRequestException('Create product error');
		}
	}

	async update(body: UpdateProductDto, productId: string) {
		const product = await this.findUnique(productId);
		if (!product) {
			throw new NotFoundException('Product does not exist');
		}
		const updatedProduct = await this.prismaService.product.update({
			where: {
				product_id: productId,
			},
			data: {
				...body,
			},
		});
		return updatedProduct;
	}

	async findAll(userId: string, skip: string, take: string) {
		try {
			const whereOptions = {
				where: {
					user_id: userId,
				},
			};
			const paginationOptions = this.defaultPaginationOptions(skip, take);
			const totalResults = await this.prismaService.product.count({
				...whereOptions,
			});
			const products = await this.prismaService.product.findMany({
				...paginationOptions,
				...whereOptions,
			});
			const totalPages = Math.ceil(totalResults / Number(take));
			const response = {
				data: products,
				totalPages,
				totalResults,
			};
			return response;
		} catch (error) {
			throw new BadRequestException('Find all product error');
		}
	}

	async findUnique(productId: string) {
		const product = await this.prismaService.product.findUnique({
			where: {
				product_id: productId,
			},
		});
		if (!product) {
			throw new NotFoundException('Product does not exist');
		}
		return product;
	}

	async delete(productId: string, response: ExpressResponse) {
		const product = await this.findUnique(productId);
		if (!product) {
			throw new NotFoundException('Product does not exist');
		}
		await this.prismaService.product.delete({
			where: {
				product_id: productId,
			},
		});
		return response.json({
			message: 'Product removed successfully',
		});
	}

	private defaultPaginationOptions(
		skip: string,
		take: string,
	): Prisma.ProductFindManyArgs {
		return {
			skip: Number(skip),
			take: Number(take),
			orderBy: {
				createdAt: 'desc',
			},
		};
	}
}
