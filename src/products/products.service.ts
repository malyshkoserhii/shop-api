import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
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
				id: productId,
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
				total_pages: totalPages,
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
		if (!product) {
			throw new NotFoundException('Product does not exist');
		}
		return product;
	}

	async delete(productId: string) {
		const product = await this.findUnique(productId);
		if (!product) {
			throw new NotFoundException('Product does not exist');
		}
		await this.prismaService.product.delete({
			where: {
				id: productId,
			},
		});
		return {
			message: 'Product removed successfully',
		};
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
