import { Product } from "../models/product";
import { Request, Response } from "express";
import { httpLogger } from "../logger/logger";
import { Image } from "../models/image";
import LikeController from "./likesController";
import ViewController from "./viewsController";
import { getUserAgent } from "../utils/userAgent";
import CommentController from "./commentController";
import { getPaginate } from "../utils/pagination";
export default class ProductController {
	// create new product
	public static async createProduct(req: Request, res: Response) {
		const userAgent: string = await getUserAgent(req);

		if (userAgent === "admin") {
			try {
				const newProduct = new Product({
					id: req.body.id,
					name: req.body.name,
					details: req.body.details ?? req.body.name,
					price: req.body.price,
					tags: req.body.tags,
				});

				await ViewController.createView(req, res, newProduct._id);
				await LikeController.createLike(req, res, newProduct._id);
				await newProduct.save();

				res.status(200).json({
					success: true,
					message: "New Product Created",
					product: newProduct,
				});
				httpLogger.log("info", {
					message: "New Product Created",
					userid: req.cookies.userId,
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
					userid: req.cookies.userId,
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
				userid: req.cookies.userId,
				req,
				res,
				userAgent,
			});
		}
	}

	//returns a list of products
	public static async products(req: Request, res: Response) {
		const userAgent: string = await getUserAgent(req);
		try {
			const paginate = await getPaginate(req);
			const products = await Product.find()
				.sort({ id: 1 })
				.skip(paginate.offset)
				.limit(paginate.limit)
				.exec();
			res.json({
				products,
				page: paginate.page,
				count: paginate.limit,
				totalPage: paginate.totalPage,
			});
			httpLogger.log("info", {
				message: "Success",
				user: userAgent,
				userid: req.cookies.userId,
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
				userid: req.cookies.userId,
				req,
				res,
				userAgent,
			});
		}
	}

	// returns product details for :productId
	public static async productDetail(req: Request, res: Response) {
		const userAgent: string = await getUserAgent(req);
		try {
			const product = await Product.findOne({
				id: req.params.productId,
			}).exec();

			if (await ViewController.chekcViews(product?._id!)) {
				ViewController.addView(product?._id!, req.cookies.userId);
			} else {
				await ViewController.createView(req, res, product?._id!);
			}

			if (product) {
				const images = (await Image.findOne({ productId: product._id }))
					?.images;
				res.json({
					product,
					images: images,
					views: await ViewController.getViews(product?._id!),
					likes: await LikeController?.getLikes(product?._id!),
					comments: await CommentController.getComments(product?._id),
				});

				httpLogger.log("info", {
					message: `Product Details ID: ${product?._id} `,
					user: userAgent,
					userid: req.cookies.userId,
					req,
					res,
				});
			} else {
				res.status(404).send(
					`Product with Id: ${req.params.productId} Not Found`
				);
				httpLogger.log("error", {
					message: `Product ${req.params.productId} Not Found`,
					req,
					res,
					user: userAgent,
				});
			}
		} catch (err) {
			res.status(500).json({
				success: false,
				message: (err as Error).message,
			});
			httpLogger.log("error", {
				message: err.message as string,
				userid: req.cookies.userId,
				req,
				res,
				user: userAgent,
			});
		}
	}

	// returns products with matching keywords
	public static async search(req: Request, res: Response) {
		const userAgent: string = await getUserAgent(req);

		try {
			const products = await Product.find({
				tags: req.body.searchKey,
			}).exec();

			res.json({ success: true, products });
			httpLogger.log("info", {
				message: "Success",
				userid: req.cookies.userId,
				req,
				res,
				user: userAgent,
			});
		} catch (err) {
			res.status(500).json({
				success: false,
				message: (err as Error).message,
			});
			httpLogger.log("error", {
				message: (err as Error).message,
				userid: req.cookies.userId,
				req,
				res,
				user: userAgent,
			});
		}
	}

	//upload images to product
	public static async addImage(req: Request, res: Response) {
		const userAgent: string = await getUserAgent(req);

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
					userid: req.cookies.userId,
					req,
					res,
					user: userAgent,
				});
			} catch (err) {
				res.status(500).json({
					success: false,
					message: (err as Error).message,
				});
				httpLogger.log("error", {
					message: (err as Error).message,
					userid: req.cookies.userId,
					req,
					res,
					user: userAgent,
				});
			}
		} else {
			res.status(403).json({
				success: false,
				message: "Permission Denied",
			});

			httpLogger.log("error", {
				message: "Forbidden Operation: Not Enough Permission",
				userid: req.cookies.userId,
				req,
				res,
				user: userAgent,
			});
		}
	}

	public static async addLike(req: Request, res: Response) {
		const userAgent: string = await getUserAgent(req);
		try {
			const product = await Product.findOne({
				id: req.params.productId,
			}).exec();

			if (!(await LikeController.checkLikes(product?._id!))) {
				await LikeController.createLike(req, res, product?._id!);
			}
			const liked = await LikeController.toggleLike(
				product?._id!,
				req.cookies.userId
			);

			res.json({ Liked: liked, Proudct: product?._id });

			httpLogger.log("info", {
				message: `Liked Product: ${product?._id}`,
				userid: req.cookies.userId,
				req,
				res,
				user: userAgent,
			});
		} catch (err) {
			console.log(err);
			httpLogger.log("error", {
				message: (err as Error).message,
				userid: req.cookies.userId,
				req,
				res,
				user: userAgent,
			});
		}
	}

	public static async getMostViewed(req: Request, res: Response) {
		const userAgent = getUserAgent(req);
		try {
			const paginate = await getPaginate(req);
			const products = await ViewController.mostViewed(
				paginate.offset,
				paginate.limit
			);
			res.status(200).json({
				products,
				page: paginate.page,
				count: paginate.limit,
				totalPage: paginate.totalPage,
			});

			httpLogger.log("info", {
				message: "Product List: Most Viewed",
				userid: req.cookies.userId,
				req,
				res,
				user: userAgent,
			});
		} catch (err) {
			httpLogger.log("error", {
				message: (err as Error).message,
				userid: req.cookies.userId ?? "anonymous",
				req,
				res,
				user: userAgent,
			});
		}
	}

	public static async getMostLiked(req: Request, res: Response) {
		const userAgent = getUserAgent(req);
		try {
			const paginate = await getPaginate(req);
			const products = await LikeController.mostLiked(
				paginate.offset,
				paginate.limit
			);
			res.status(200).json({
				products,
				page: paginate.page,
				count: paginate.limit,
				totalPage: paginate.totalPage,
			});

			httpLogger.log("info", {
				message: "Product List: Most Liked",
				userid: req.cookies.userId,
				req,
				res,
				user: userAgent,
			});
		} catch (err) {
			httpLogger.log("error", {
				message: (err as Error).message,
				userid: req.cookies.userId ?? "anonymous",
				req,
				res,
				user: userAgent,
			});
		}
	}

	public static async filterByPrice(req: Request, res: Response) {
		const userAgent = getUserAgent(req);
		try {
			const paginate = await getPaginate(req);
			const products = await Product.find()
				.sort({ price: -1, id: 1 })
				.skip(paginate.offset)
				.limit(paginate.limit)
				.exec();
			res.status(200).json({
				products,
				page: paginate.page,
				count: paginate.limit,
				totalPage: paginate.totalPage
			});

			httpLogger.log("info", {
				message: "Product: By Price",
				userid: req.cookies.userId,
				req,
				res,
				user: userAgent,
			});
		} catch (err) {
			httpLogger.log("error", {
				message: (err as Error).message,
				userid: req.cookies.userId ?? "anonymous",
				req,
				res,
				user: userAgent,
			});
		}
	}
}
