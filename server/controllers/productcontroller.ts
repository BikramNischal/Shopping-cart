import { Product } from "../models/product";
import { Request, Response } from "express";


//returns a list of products 
export async function product (req: Request, res: Response) {
	const products = await Product.find().exec();
	res.json(products);
};

// returns product details for :productId
export async function productDetail (req: Request, res: Response) {
	console.log(req.params.productId);
	const product = await Product.findOne({ id: req.params.productId }).exec();
	if (product) {
		res.json(product);
	} else {
		res.sendStatus(404);
	}
};
