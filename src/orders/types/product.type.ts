export type OrderProduct = {
	id: string;
	quantity: number;
	price_at_purchase: number;
};

export type OrderUnique = {
	order_details_id: string;
	product_id: string;
	name: string;
	description: string;
	price_at_purchase: number;
	quantity: number;
};
