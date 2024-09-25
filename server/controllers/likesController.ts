import { Like } from "../models/likes";
import { Types } from "mongoose";
import { Request, Response } from "express";
import { httpLogger } from "../logger/logger";
import { getUserAgent } from "../utils/userAgent";

export default class LikeController {
	public static async createLike(
		req: Request,
		res: Response,
		productId: Types.ObjectId
	) {
		const userAgent = await getUserAgent(req.cookies.userId);
		try {
			const newLike = new Like({
				productId: productId,
				likes: [],
				likeCount: 0
			});
			await newLike.save();

			httpLogger.log("info", {
				message: `Created A Like Document For ${productId}`,
				user: userAgent,
				userid: req.cookies.userId,
				req,
				res,
			});
		} catch (err) {
			httpLogger.log("error", {
				message: (err as Error).message,
				userid: req.cookies.userId,
				user: userAgent,
				req,
				res,
			});
		}
	}

	public static async toggleLike(
		productId: Types.ObjectId,
		userId: Types.ObjectId
	) {
		const like = await Like.findOne({ productId: productId }).exec();
		const index: number = like?.likes.indexOf(userId) as number;

		let liked = false;
		if (index < 0) {
			await Like.findByIdAndUpdate(like?._id, {
				"$push": {"likes": userId},
				"$inc": {"likeCount": 1}
			});
			liked = true;
		} else {
			await Like.findByIdAndUpdate(like?._id, {
				"$pull": {"likes": userId},
				"$inc": {"likeCount": -1}
			});
		}
		return liked;

		// TODO: Logger
	}

	public static async checkLikes(productId: Types.ObjectId) {
		return (await Like.findOne({ productId: productId }).exec())
			? true
			: false;
	}

	public static async getLikes(productId: Types.ObjectId) {
		const views = await Like.findOne({ productId: productId }).exec();
		return views?.likeCount;
	}

	public static async mostLiked(offset: number, limit:number) {
		const products = await Like.find()
			.sort({ likeCount: -1, productId: 1 })
			.select(["productId", "likeCount"])
			.populate("productId")
			.skip(offset)
			.limit(limit)
			.exec();
		return products;
	}
}
