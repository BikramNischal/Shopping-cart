import { Request, Response } from "express";
import { User } from "../models/user";
import { Cart } from "../models/cart";
import { Product } from "../models/product";
import { httpLogger } from "../logger/logger";

// return cart list
export default class CartController {
	public static async cartList(req: Request, res: Response) {
		try {
			const user = await User.findById(req.cookies.userId).exec();
			const cart = await Cart.findById(user?.cartId)
				.populate("products")
				.exec();
			res.json(cart?.products);
			httpLogger.log("info", "Cart List", { req, res });
		} catch (err) {
			console.error(err);
		}
	}

	public static async addToCart(req: Request, res: Response) {
		try {
			const user = await User.findById(req.cookies.userId).exec();
			const product = await Product.findOne({
				id: req.body.productId,
			}).exec();

			if (user && product) {
				const cart = await Cart.findById(user.cartId).exec();
				if (cart) {
					cart.products.push(product._id);
					await cart.save();
					res.send(`product id : ${product.id} is added to cart`);
					httpLogger.log("info", "Product added", { req, res });
				}
			} else {
				res.status(404);
				const msg = user ? "Product Not Found" : "User Not Found!";
				res.send(msg);
				httpLogger.log("error", "User/Product Not Found", { req, res });
			}
		} catch (err) {
			console.error(err);
			httpLogger.log("error", (err as Error).message, { req, res });
		}
	}

	public static async removeFromCart(req: Request, res: Response) {
		if (!req.cookies.userId) {
			res.status(400).send("User Not Logged In!");
			httpLogger.log("error", "User Not Logged In", { req, res });
		}
		try {
			const user = await User.findById(req.cookies.userId).exec();
			const product = await Product.findOne({
				id: req.params.productId,
			}).exec();

			if (user && product) {
				const cart = await Cart.findById(user.cartId).exec();
				const index: number = cart?.products.indexOf(
					product._id
				) as number;

				if (index >= 0) {
					cart?.products.splice(index, 1);
					await cart?.save();
					res.send(`Product Id: ${product.id} Removed From Cart`);
					httpLogger.log("info", "Item Deleted", { req, res });
				} else {
					res.status(406);
					res.send("No such product on cart");
					httpLogger.log("error", "No such product on cart", {
						req,
						res,
					});
				}
			} else {
				res.status(404);
				res.send(`Product with id ${req.params.productId} Not Found`);
				httpLogger.log("error", "Product not found", { req, res });
			}
		} catch (err) {
			console.error(err);
			httpLogger.log("error", (err as Error).message, { req, res });
		}
	}
}
