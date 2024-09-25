import { Product } from "../models/product";
import { Request } from "express";

export interface IPaginate {
	page: number;
	limit: number;
	offset: number;
	totalPage: number;
}

export async function getPaginate(req: Request): Promise<IPaginate> {
	const itemsCount = await Product.countDocuments().exec() as number;
	const limit = (req.query.limit ?? itemsCount) as number;
	const page = (req.query.page ?? 0) as number;
	return {
		page,
		limit,
		offset: page ? (page - 1) * limit : 0,
		totalPage: Math.ceil(itemsCount/limit),  
	};
}
