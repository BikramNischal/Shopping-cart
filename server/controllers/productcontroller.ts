import { Product } from "../models/product";
import { Request, Response } from "express";
import { httpLogger } from "../logger/logger";
import { User } from "../models/user";
import { Image } from "../models/image";

export default class ProductController {
	// create new product
	public static async createProduct(req: Request, res: Response) {
		const userAgent: string = req.cookies.userId
			? ((await User.findById(req.cookies.userId).exec())?.role as string)
			: "anonymous";

		if (userAgent === "admin") {
			try {
				const newProduct = new Product({
					id: req.body.id,
					name: req.body.name,
					details: req.body.details ?? req.body.name,
					price: req.body.price,
					tags: req.body.tags,
				});

				await newProduct.save();

				res.status(200).json({
					success: true,
					message: "New Product Created",
					product: newProduct,
				});
				httpLogger.log("info", {
					message: "New Product Created",
					req,
					res,
					userAgent,
				});
			} catch (err) {
				res.status(500).json({
					success: false,
					message: (err as Error).message,
				});
				httpLogger.log("error", {
					message: err.message as string,
					req,
					res,
					userAgent,
				});
			}
		} else {
			res.status(403).json({
				success: false,
				message: "Permission Denied",
			});

			httpLogger.log("error", {
				message: "Forbidden Operation: Not Enough Permission",
				req,
				res,
				userAgent,
			});
		}
	}

	//returns a list of products
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
			res.status(500).json({
				success: false,
				message: (err as Error).message,
			});
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

			if (product) {
				const images = (await Image.findOne({ productId: product._id }))
					?.images;
				res.json({product, images: images });
			} else {
				res.status(404).send(
					`Product with Id: ${req.params.productId} Not Found`
				);
				httpLogger.log("error", {
					message: `Product ${req.params.productId} Not Found`,
					req,
					res,
					userAgent,
				});
			}
			httpLogger.log("info", {
				message: "Success",
				user: userAgent,
				req,
				res,
			});
		} catch (err) {
			res.status(500).json({
				success: false,
				message: (err as Error).message,
			});
			httpLogger.log("error", {
				message: err.message as string,
				req,
				res,
				userAgent,
			});
		}
	}

	// returns products with matching keywords
	public static async search(req: Request, res: Response) {
		const userAgent = req.cookies.userId
			? (await User.findById(req.cookies.userId).exec())?.role
			: "anonymous";

		try {
			const products = await Product.find({
				tags: req.body.searchKey,
			}).exec();

			res.json({ success: true, products });
			httpLogger.log("info", {
				message: "Success",
				req,
				res,
				userAgent,
			});
		} catch (err) {
			res.status(500).json({
				success: false,
				message: (err as Error).message,
			});
			httpLogger.log("error", {
				message: (err as Error).message,
				req,
				res,
				userAgent,
			});
		}
	}

	//upload images to product
	public static async addImage(req: Request, res: Response) {
		const userAgent = req.cookies.userId
			? (await User.findById(req.cookies.userId).exec())?.role
			: "anonymous";

		if (userAgent === "admin") {
			try {
				const product = await Product.findOne({
					id: req.params.productId,
				}).exec();

				const img = await Image.findOne({
					productId: product?._id,
				});

				if (img) {
					img.images.push(req.file?.filename as string);
					await img.save();
				} else {
					const newImg = new Image({
						productId: product?._id,
						images: [req.file?.filename as string],
					});
					await newImg.save();
				}
				res.json({
					success: true,
					message: `Image add to product ${product?._id}`,
				});
				httpLogger.log("info", {
					message: `Image Add To Product: ${product?._id}`,
					req,
					res,
					userAgent,
				});
			} catch (err) {
				res.status(500).json({
					success: false,
					message: (err as Error).message,
				});
				httpLogger.log("error", {
					message: (err as Error).message,
					req,
					res,
					userAgent,
				});
			}
		} else {
			res.status(403).json({
				success: false,
				message: "Permission Denied",
			});

			httpLogger.log("error", {
				message: "Forbidden Operation: Not Enough Permission",
				req,
				res,
				userAgent,
			});
		}
	}
}
