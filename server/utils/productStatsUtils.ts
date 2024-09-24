import { ProductStats } from "../models/productStats";
import { Product } from "../models/product";
import { Types } from "mongoose";

export async function checkStats(productId: Types.ObjectId) {
	const productStats = await ProductStats.findOne({
		productId: productId,
	}).exec();
	return productStats ? true : false;
}

export async function createProductStats(productId: Types.ObjectId) {
	const productStats = new ProductStats({
		productId: productId,
		views: [],
		likes: [],
		comments: [],
	});
	try {
		await productStats.save();
		return productStats;
	} catch (err) {
		console.log(err);
	}
}
