import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from '@nestjs/common';
import { ProductsController } from './products.controller';

import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from './products.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { IsExistMiddleware } from 'src/common/middlewares';

@Module({
	imports: [UsersModule],
	controllers: [ProductsController],
	providers: [ProductsService, UsersService],
})
export class ProductsModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		const isExistMiddleware = new IsExistMiddleware(new PrismaService());

		consumer
			.apply(isExistMiddleware.use('product', 'id'))
			.exclude({ path: 'products/all', method: RequestMethod.GET })
			.forRoutes({ path: 'products/:id', method: RequestMethod.GET });
	}
}
