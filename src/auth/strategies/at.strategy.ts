import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
	sub: string;
	email: string;
};

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: 'at-secret',
		});
	}

	async validate(payload: JwtPayload) {
		return payload;
	}
}
