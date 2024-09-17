import { Request, Response } from "express";
import { User } from "../models/user";
import { Cart } from "../models/cart";
import { Product } from "../models/product";
import { httpLogger } from "../logger/logger";

// return cart list
export default class CartController {
	public static async cartList(req: Request, res: Response) {
		const user = await User.findById(req.cookies.userId).exec();

		try {
			const cart = await Cart.findById(user?.cartId)
				.populate("products")
				.exec();
			res.json(cart?.products);

			httpLogger.log("info", {
				message: "Success",
				user: user?.role,
				req,
				res,
			});
		} catch (err) {
			httpLogger.log("error", {
				message: (err as Error).message,
				req,
				res,
				user: user?.role,
			});
		}
	}

	public static async addToCart(req: Request, res: Response) {
		const user = await User.findById(req.cookies.userId).exec();
		try {
			const product = await Product.findOne({
				id: req.body.productId,
			}).exec();

			if (user && product) {
				const cart = await Cart.findById(user.cartId).exec();
				if (cart) {
					cart.products.push(product._id);
					await cart.save();
					res.send(`product id : ${product.id} is added to cart`);
					httpLogger.log("info", {
						message: "Product Added To Cart",
						user: user?.role,
						req,
						res,
					});
				}
			} else {
				const msg = user ? "Product Not Found" : "User Not Found!";
				res.status(404).send(msg);

				httpLogger.log("error", {
					message: msg,
					req,
					res,
					user: user?.role,
				});
			}
		} catch (err) {
			httpLogger.log("error", {
				message: (err as Error).message,
				req,
				res,
				user: user?.role,
			});
		}
	}

	public static async removeFromCart(req: Request, res: Response) {
		const user = await User.findById(req.cookies.userId).exec();
		try {
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

					httpLogger.log("info", {
						message: "Product Remove From Cart",
						user: user?.role,
						req,
						res,
					});
				} else {
					res.status(406).send("No such product on cart");
					httpLogger.log("error", {
						message: "Product Not Found On Cart",
						req,
						res,
						user: user?.role,
					});
				}
			} else {
				res.status(404).send(
					`Product with id ${req.params.productId} Not Found`
				);
				httpLogger.log("error", {
					message: "Product Not Found!",
					req,
					res,
					user: user?.role,
				});
			}
		} catch (err) {
			console.error(err);
			httpLogger.log("error", {
				message: (err as Error).message,
				req,
				res,
				user: user?.role,
			});
		}
	}
}
