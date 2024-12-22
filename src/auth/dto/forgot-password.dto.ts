import { IsEmail } from 'class-validator';

export class ForgotPasswordlDto {
	@IsEmail()
	email: string;
}
