import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Res,
	UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { AtGuard } from 'src/common/guards';

@Controller('users')
export class UsersController {
	constructor(private userService: UsersService) {}

	@UseGuards(AtGuard)
	@Get(':id')
	@HttpCode(HttpStatus.OK)
	findUnique(@Param() userId: string) {
		return this.userService.findUnique(userId);
	}
}
