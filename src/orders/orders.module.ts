import { Module } from '@nestjs/common';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderDetailsService } from 'src/order-details/order-details.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { OrderDetailsModule } from 'src/order-details/order-details.module';
import { ProductsModule } from 'src/products/products.module';
import { ProductsService } from 'src/products/products.service';

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
export class OrdersModule {}
