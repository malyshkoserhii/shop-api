import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
	constructor(private prismaService: PrismaService) {}

	async findUnique(userId: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id: userId,
			},
		});
		return user;
	}
}
