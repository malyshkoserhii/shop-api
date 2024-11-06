import {
	Body,
	Controller,
	Delete,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';

import { OrderDetailsService } from './order-details.service';
import { AtGuard } from 'src/common/guards';

@Controller('order-details')
export class OrderDetailsController {
	constructor(private ordersDetailsService: OrderDetailsService) {}

	@UseGuards(AtGuard)
	@Delete('delete/:id')
	@HttpCode(HttpStatus.OK)
	delete(@Param('id') detailsId: string, @Query('orderId') orderId: string) {
		return this.ordersDetailsService.delete(detailsId, orderId);
	}
}
