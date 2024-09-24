import { Request, Response } from "express";
import { User } from "../models/user";
import { Wishlist } from "../models/wishlist";
import { Product } from "../models/product";
import { httpLogger } from "../logger/logger";

// return wishlist list
export default class WishlistController {
	public static async wishlist(req: Request, res: Response) {
		const user = await User.findById(req.cookies.userId).exec();
		try {
			const wishlist = await Wishlist.findOne({
				userId: user?._id,
			})
				.populate("products")
				.exec();

			res.json(wishlist ? wishlist.products : []);

			httpLogger.log("info", {
				message: "Success",
				user: user?.role,
				userid: user?._id,
				req,
				res,
			});
		} catch (err) {
			httpLogger.log("error", {
				message: (err as Error).message,
				userid: user?._id,
				req,
				res,
				user: user?.role,
			});
		}
	}

	public static async addToWishlist(req: Request, res: Response) {
		const user = await User.findById(req.cookies.userId).exec();

		try {
			const product = await Product.findOne({
				id: req.body.productId,
			}).exec();

			if (product) {
				const wishlist = await Wishlist.findOne({
					userId: user?._id,
				}).exec();
				if (wishlist) {
					wishlist.products.push(product._id);
					await wishlist.save();
				} else {
					const wishlist = new Wishlist({
						userId: req.cookies.userId,
						products: [product._id],
					});
					await wishlist.save();
				}
				res.send(`product id : ${product.id} is added to wishlist`);
				httpLogger.log("info", {
					message: "Product Added To Wishlist",
					userid: user?._id,
					user: user?.role,
					req,
					res,
				});
			} else {
				const msg = user ? "Product Not Found" : "User Not Found!";
				res.status(404).send(msg);

				httpLogger.log("error", {
					message: msg,
					userid: user?._id,
					req,
					res,
					user: user?.role,
				});
			}
		} catch (err) {
			httpLogger.log("error", {
				message: (err as Error).message,
				userid: user?._id,
				req,
				res,
				user: user?.role,
			});
		}
	}

	public static async removeFromWishlist(req: Request, res: Response) {
		const user = await User.findById(req.cookies.userId).exec();
		try {
			const product = await Product.findOne({
				id: req.params.productId,
			}).exec();

			if (user && product) {
				const wishlist = await Wishlist.findOne({
					userId: user._id,
				}).exec();
				const index: number = wishlist?.products.indexOf(
					product._id
				) as number;

				if (index >= 0) {
					wishlist?.products.splice(index, 1);
					await wishlist?.save();

					res.send(`Product Id: ${product.id} Removed From wishlist`);

					httpLogger.log("info", {
						message: "Product Remove From wishlist",
						userid: user?._id,
						user: user?.role,
						req,
						res,
					});
				} else {
					res.status(406).send("No such product on wishlist");
					httpLogger.log("error", {
						message: "Product Not Found On wishlist",
						userid: user?._id,
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
					userid: user?._id,
					req,
					res,
					user: user?.role,
				});
			}
		} catch (err) {
			console.error(err);
			httpLogger.log("error", {
				message: (err as Error).message,
				userid: user?._id,
				req,
				res,
				user: user?.role,
			});
		}
	}
}
