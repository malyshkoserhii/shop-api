import { Injectable } from '@nestjs/common';
import { AuthDto } from 'src/auth/dto';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
	constructor(private prismaService: PrismaService) {}

	async create(dto: AuthDto, hash: string) {
		await this.prismaService.user.create({
			data: {
				email: dto.email,
				hash,
			},
		});
	}

	async findUnique(userId: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id: userId,
			},
		});
		return user;
	}

	async findUserByEmail(email: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				email,
			},
		});
		return user;
	}

	async updateVerificationCode(email: string, code: number) {
		await this.prismaService.user.update({
			where: {
				email,
			},
			data: {
				code,
			},
		});
	}

	async updateVerificationStatus(email: string, status: boolean) {
		await this.prismaService.user.update({
			where: {
				email,
			},
			data: {
				is_verified: status,
				code: null,
			},
		});
	}
}
