import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategies';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [JwtModule.register({}), UsersModule, ConfigModule, EmailModule],
	controllers: [AuthController],
	providers: [
		AuthService,
		AtStrategy,
		RtStrategy,
		UsersService,
		EmailService,
	],
})
export class AuthModule {}
