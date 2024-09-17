import { Product } from "../models/product";
import { Request, Response } from "express";
import { httpLogger } from "../logger/logger";
import { User } from "../models/user";

//returns a list of products
export default class ProductController {
	public static async products(req: Request, res: Response) {
		const userAgent: string = req.cookies.userId
			? ((await User.findById(req.cookies.userId).exec())?.role as string)
			: "anonymous";
		try {
			const products = await Product.find().exec();
			res.json(products);
			httpLogger.log("info", {
				message: "Success",
				user: userAgent,
				req,
				res,
			});
		} catch (err) {
			httpLogger.log("error", {
				message: err.message as string,
				req,
				res,
				userAgent,
			});
		}
	}

	// returns product details for :productId
	public static async productDetail(req: Request, res: Response) {
		const userAgent = req.cookies.userId
			? (await User.findById(req.cookies.userId).exec())?.role
			: "anonymous";
		try {
			const product = await Product.findOne({
				id: req.params.productId,
			}).exec();
			product
				? res.json(product)
				: res
						.status(404)
						.send(
							`Product with Id: ${req.params.productId} Not Found`
						);
			httpLogger.log("info", {
				message: "Success",
				user: userAgent,
				req,
				res,
			});
		} catch (err) {
			httpLogger.log("error", {
				message: err.message as string,
				req,
				res,
				userAgent,
			});
		}
	}
}
