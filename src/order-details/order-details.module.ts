import { Module } from '@nestjs/common';

import { OrderDetailsController } from './order-details.controller';
import { OrderDetailsService } from './order-details.service';
import { ProductsModule } from 'src/products/products.module';
import { ProductsService } from 'src/products/products.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

@Module({
	imports: [ProductsModule, UsersModule],
	controllers: [OrderDetailsController],
	providers: [OrderDetailsService, ProductsService, UsersService],
})
export class OrderDetailsModule {}
