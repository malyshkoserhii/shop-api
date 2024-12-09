import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters';
import { RolesGuard } from './common/guards';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());
	app.useGlobalFilters(new HttpExceptionFilter());
	app.enableCors({
		origin: 'http://localhost:5173',
		credentials: true,
	});
	await app.listen(process.env.PORT ?? 3030);
}
bootstrap();
