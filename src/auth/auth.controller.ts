import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Res,
	UseGuards,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';

import { AuthService } from './auth.service';
import {
	AuthDto,
	ForgotPasswordlDto,
	SetNewPasswordlDto,
	VerifyEmailDto,
} from './dto';
import { Tokens } from './types';
import { AtGuard, RtGuard } from '../common/guards';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Public()
	@Post('signup')
	@HttpCode(HttpStatus.CREATED)
	signup(@Body() body: AuthDto, @Res() response: ExpressResponse) {
		return this.authService.signup(body, response);
	}

	@Public()
	@Post('signin')
	@HttpCode(HttpStatus.OK)
	signin(@Body() body: AuthDto): Promise<Tokens> {
		return this.authService.signin(body);
	}

	@Public()
	@Post('verify-email')
	@HttpCode(HttpStatus.OK)
	verifyEmail(
		@Body() body: VerifyEmailDto,
		@Res() response: ExpressResponse,
	) {
		return this.authService.verifyEmail(body, response);
	}

	@Public()
	@Post('reset-password')
	@HttpCode(HttpStatus.OK)
	forgotPaswrod(
		@Body() body: ForgotPasswordlDto,
		@Res() response: ExpressResponse,
	) {
		return this.authService.forgotPassword(body, response);
	}

	@Public()
	@Post('verify-reset-password')
	@HttpCode(HttpStatus.OK)
	verifyResetPassword(
		@Body() body: VerifyEmailDto,
		@Res() response: ExpressResponse,
	) {
		return this.authService.verifyResetPassword(body, response);
	}

	@Public()
	@Post('set-new-password')
	@HttpCode(HttpStatus.OK)
	setNewPassword(
		@Body() body: SetNewPasswordlDto,
		@Res() response: ExpressResponse,
	) {
		return this.authService.setNewPassword(body, response);
	}

	@UseGuards(AtGuard)
	@Post('logout')
	@HttpCode(HttpStatus.OK)
	logout(@GetCurrentUserId() userId: string) {
		return this.authService.logout(userId);
	}

	@Public()
	@UseGuards(RtGuard)
	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	refresh(
		@GetCurrentUserId() userId: string,
		@GetCurrentUser('refreshToken') refreshToken: string,
	): Promise<Tokens> {
		return this.authService.refresh(userId, refreshToken);
	}
}
