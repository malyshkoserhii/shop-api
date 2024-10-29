import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

@Module({
	imports: [UsersModule],
	controllers: [ProductsController],
	providers: [ProductsService, UsersService],
})
export class ProductsModule {}
