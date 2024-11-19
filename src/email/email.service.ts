import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as postmark from 'postmark';

@Injectable()
export class EmailService {
	private client: postmark.ServerClient;

	constructor(private configService: ConfigService) {
		this.client = new postmark.ServerClient(
			this.configService.get('POSTMARK_API_KEY'),
		);
	}

	async sendEmail(email: string, verificationCode: number) {
		const emailBody = `<p>Your verification code is ${verificationCode}</p>`;
		const msg = {
			From: 'malyshkoserhii@meta.ua',
			To: email,
			Subject: 'Awesome Store. Confrim your email',
			HtmlBody: emailBody,
		};

		this.client.sendEmail(msg).then(
			() => {},
			(error) => {
				console.error(error);

				if (error.response) {
					console.error(error.response?.body);
				}
			},
		);
	}
}
