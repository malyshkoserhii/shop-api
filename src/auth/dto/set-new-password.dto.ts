import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SetNewPasswordlDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	password: string;
}
