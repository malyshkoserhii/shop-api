import {
	BadGatewayException,
	BadRequestException,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response as ExpressResponse } from 'express';

import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, VerifyEmailDto } from './dto';
import { Tokens } from './types';
import { UsersService } from 'src/users/users.service';
import { EmailService } from 'src/email/email.service';
import { generateCode } from 'src/common/utils';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
	constructor(
		private prismaService: PrismaService,
		private jwtService: JwtService,
		private userService: UsersService,
		private emailService: EmailService,
	) {}

	async signup(dto: AuthDto, response: ExpressResponse) {
		const hash = await this.hashData(dto.password);

		const isExist = await this.userService.findUserByEmail(dto.email);

		if (isExist) {
			throw new BadRequestException(
				'This email has been already registered',
			);
		}

		// create new user db record
		await this.userService.create(dto, hash);

		await this.sendCode(dto.email);

		// const code = generateCode();

		// await this.userService.updateVerificationCode(dto.email, code);

		// await this.emailService.sendEmail(dto.email, code);

		return response.json({
			message: 'User successfully registered. Please check your email',
		});
	}

	async signin(dto: AuthDto): Promise<Tokens> {
		const user = await this.userService.findUserByEmail(dto.email);

		if (!user) {
			throw new ForbiddenException('Incorrect email or password');
		}

		const isPasswordMatch = await bcrypt.compare(dto.password, user.hash);

		if (!isPasswordMatch) {
			throw new ForbiddenException('Incorrect email or password');
		}

		if (!user.is_verified) {
			await this.sendCode(dto.email);

			throw new BadRequestException(
				'Account is not verified. Please check your email',
			);
		}

		const tokens = await this.getTokens(user.id, user.email, user.role);

		await this.updateRtHash(user.id, tokens.refresh_token);

		return tokens;
	}

	async verifyEmail(body: VerifyEmailDto, response: ExpressResponse) {
		const user = await this.userService.findUserByEmail(body.email);

		if (!user) {
			throw new ForbiddenException('Incorrect email or password');
		}

		if (user.code === body.code) {
			await this.userService.updateVerificationStatus(body.email, true);

			return response.json({
				message: 'Your email is verified successfully',
			});
		}
		throw new ForbiddenException('Incorrect verification code');
	}

	async logout(userId: string) {
		await this.prismaService.user.updateMany({
			where: {
				id: userId,
				hashed_rt: {
					not: null,
				},
			},
			data: {
				hashed_rt: null,
			},
		});
	}

	async refresh(userId: string, refreshToken: string) {
		const user = await this.userService.findUnique(userId);

		if (!user || !user.hashed_rt) {
			throw new ForbiddenException('Access denied!');
		}

		const isHashMatch = await bcrypt.compare(refreshToken, user.hashed_rt);

		if (!isHashMatch) {
			throw new ForbiddenException('Access denied!');
		}

		const tokens = await this.getTokens(userId, user.email, user.role);

		await this.updateRtHash(userId, tokens.refresh_token);

		return tokens;
	}

	private async sendCode(email: string) {
		try {
			const code = generateCode();

			await this.userService.updateVerificationCode(email, code);

			await this.emailService.sendEmail(email, code);
		} catch (error) {
			throw error;
		}
	}

	private async updateRtHash(userId: string, rt: string) {
		const hash = await this.hashData(rt);
		await this.prismaService.user.update({
			where: {
				id: userId,
			},
			data: {
				hashed_rt: hash,
			},
		});
	}

	private async getTokens(
		userId: string,
		email: string,
		role: Role,
	): Promise<Tokens> {
		const [at, rt] = await Promise.all([
			this.jwtService.signAsync(
				{
					sub: userId,
					email,
					role,
				},
				{
					secret: 'at-secret',
					expiresIn: 60 * 60, // 60 minutes
				},
			),
			this.jwtService.signAsync(
				{
					sub: userId,
					email,
					role,
				},
				{ secret: 'rt-secret', expiresIn: 60 * 60 * 24 * 7 }, // 7 days
			),
		]);
		return {
			access_token: at,
			refresh_token: rt,
		};
	}

	private async hashData(data: string) {
		return await bcrypt.hash(data, 10);
	}
}
