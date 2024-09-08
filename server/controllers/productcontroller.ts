import { Product } from "../models/product";
import { Request, Response } from "express";

//returns a list of products
export default class ProductController {
	public static async products(req: Request, res: Response) {
		try {
			const products = await Product.find().exec();
			res.json(products);
		} catch (err) {
			console.log(err);
		}
	}

	// returns product details for :productId
	public static async productDetail(req: Request, res: Response) {
		try {
			const product = await Product.findOne({
				id: req.params.productId,
			}).exec();
			product ? res.json(product) : res.sendStatus(404);
		} catch (err) {
			console.error(err);
		}
	}
}
