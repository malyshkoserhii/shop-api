import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from '@nestjs/common';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderDetailsService } from 'src/order-details/order-details.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { OrderDetailsModule } from 'src/order-details/order-details.module';
import { ProductsModule } from 'src/products/products.module';
import { ProductsService } from 'src/products/products.service';
import { IsExistMiddleware } from 'src/common/middlewares';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
	imports: [UsersModule, OrderDetailsModule, ProductsModule],
	controllers: [OrdersController],
	providers: [
		OrdersService,
		UsersService,
		OrderDetailsService,
		ProductsService,
	],
})
export class OrdersModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		const isExistMiddleware = new IsExistMiddleware(new PrismaService());

		consumer
			.apply(isExistMiddleware.use('order', 'id'))
			.exclude({ path: 'orders/all', method: RequestMethod.GET })
			.forRoutes(
				{ path: 'orders/:id', method: RequestMethod.GET },
				{ path: 'orders/update/:id', method: RequestMethod.POST },
				{ path: 'orders/add/:id', method: RequestMethod.POST },
				{ path: 'orders/delete/:id', method: RequestMethod.DELETE },
			);
	}
}
