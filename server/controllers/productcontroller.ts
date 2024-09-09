import { Product } from "../models/product";
import { Request, Response } from "express";
import { httpLogger } from "../logger/logger";

//returns a list of products
export default class ProductController {
	public static async products(req: Request, res: Response) {
		try {
			const products = await Product.find().exec();
			res.json(products);
			httpLogger.log("info", "Success", {req, res});
		} catch (err) {
			httpLogger.log("error", err.message as string, {req, res});
			console.log(err);
		}
	}

	// returns product details for :productId
	public static async productDetail(req: Request, res: Response) {
		try {
			const product = await Product.findOne({
				id: req.params.productId,
			}).exec();
			product ? res.json(product) : res.status(404).send(`Product with Id: ${req.params.productId} Not Found`);
			httpLogger.info("Success",{req,res});
		} catch (err) {
			httpLogger.log("error", err.message as string, {req, res});
			console.error(err);
		}
	}
}
