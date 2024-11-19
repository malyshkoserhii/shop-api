import { ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response as ExpressResponse } from 'express';

import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, VerifyEmailDto } from './dto';
import { Tokens } from './types';
import { UsersService } from 'src/users/users.service';
import { EmailService } from 'src/email/email.service';
import { generateCode } from 'src/common/utils';

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

		// create new user db record
		await this.userService.create(dto, hash);

		const code = generateCode();

		await this.userService.updateVerificationCode(dto.email, code);

		await this.emailService.sendEmail(dto.email, code);

		return response.json({
			message: 'User successfully registered. Please check your email',
		});
	}

	async signin(dto: AuthDto): Promise<Tokens> {
		const user = await this.userService.findUserByEmail(dto.email);

		if (!user) {
			throw new ForbiddenException('Incorrect email or password');
		}

		if (!user.is_verified) {
			throw new ForbiddenException('Email is not veridied');
		}

		const isPasswordMatch = await bcrypt.compare(dto.password, user.hash);

		if (!isPasswordMatch) {
			throw new ForbiddenException('Incorrect email or password');
		}

		const tokens = await this.getTokens(user.id, user.email);

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
		throw new ForbiddenException('Verification code is incorrect');
	}

	async logout(userId: string) {
		await this.prismaService.user.updateMany({
			where: {
				id: userId,
				hashedRt: {
					not: null,
				},
			},
			data: {
				hashedRt: null,
			},
		});
	}

	async refresh(userId: string, refreshToken: string) {
		const user = await this.userService.findUnique(userId);

		if (!user || !user.hashedRt) {
			throw new ForbiddenException('Access denied!');
		}

		const isHashMatch = await bcrypt.compare(refreshToken, user.hashedRt);

		if (!isHashMatch) {
			throw new ForbiddenException('Access denied!');
		}

		const tokens = await this.getTokens(userId, user.email);

		await this.updateRtHash(userId, tokens.refresh_token);

		return tokens;
	}

	async updateRtHash(userId: string, rt: string) {
		const hash = await this.hashData(rt);
		await this.prismaService.user.update({
			where: {
				id: userId,
			},
			data: {
				hashedRt: hash,
			},
		});
	}

	async getTokens(userId: string, email: string): Promise<Tokens> {
		const [at, rt] = await Promise.all([
			this.jwtService.signAsync(
				{
					sub: userId,
					email,
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
				},
				{ secret: 'rt-secret', expiresIn: 60 * 60 * 24 * 7 }, // 7 days
			),
		]);
		return {
			access_token: at,
			refresh_token: rt,
		};
	}

	async hashData(data: string) {
		return await bcrypt.hash(data, 10);
	}
}
