import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [ConfigModule],
	providers: [EmailService],
})
export class EmailModule {}
