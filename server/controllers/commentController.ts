import { Comment } from "../models/comment";
import { Request, Response } from "express";
import { Product } from "../models/product";
import { getUserAgent } from "../utils/userAgent";
import { httpLogger } from "../logger/logger";
import { Types } from "mongoose";

export default class CommentController {
	public static async createComment(req: Request, res: Response) {
		const userAgent = await getUserAgent(req);
		const product = await Product.findOne({
			id: req.params.productId,
		}).exec();

		const comment = new Comment({
			productId: product?._id,
			userId: req.cookies.userId,
			comment: req.body.comment,
		});

		try {
			await comment.save();
			res.status(200).json({
				success: true,
				message: `${req.cookies.userId} Commented On ${product?._id}`,
			});
			httpLogger.log("info", {
				message: `${req.cookies.userId} Commented On ${product?._id}`,
				user: userAgent,
				userid: req.cookies.userId,
				req,
				res,
			});
		} catch (err) {
			httpLogger.log("error", {
				message: (err as Error).message,
				user: userAgent,
				userid: req.cookies.userId,
				req,
				res,
			});
		}
	}

	public static async getComments(productId: Types.ObjectId) {
		const comments = await Comment.find({ productId: productId })
			.select(["comment", "userId"])
			.exec();
		return comments;
	}
}
