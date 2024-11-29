import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IsExistMiddleware implements NestMiddleware {
	constructor(private readonly prisma: PrismaService) {}

	use(modelName: string, idField: string) {
		return async (req: Request, _res: Response, next: NextFunction) => {
			const idValue = req.params[idField];

			const whereCondition = { [idField]: String(idValue) };

			const isEntityExist = await this.prisma[modelName].findUnique({
				where: whereCondition,
			});

			if (!isEntityExist) {
				throw new NotFoundException(
					`Resource with ${idField} ${idValue} not found`,
				);
			}

			next();
		};
	}
}
