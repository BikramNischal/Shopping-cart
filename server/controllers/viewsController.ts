import { View } from "../models/views";
import { Types } from "mongoose";
import { Request, Response } from "express";
import { httpLogger } from "../logger/logger";
import { getUserAgent } from "../utils/userAgent";

export default class ViewController {
	public static async createView(
		req: Request,
		res: Response,
		productId: Types.ObjectId
	) {
		const userAgent = await getUserAgent(req.cookies.userId);
		try {
			const newView = new View({
				productId: productId,
				views: [],
				viewsCount: 0,
			});
			await newView.save();

			httpLogger.log("info", {
				message: `Created A View Document For ${productId}`,
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

	public static async addView(
		productId: Types.ObjectId,
		userId: Types.ObjectId
	) {
		const view = await View.findOne({ productId: productId }).exec();
		const index: number = view?.views.indexOf(userId) as number;

		if (index < 0) {
			await View.findByIdAndUpdate(view?._id, {
				$push: { views: userId },
				$inc: { viewsCount: 1 },
			});
		}
	}

	public static async chekcViews(productId: Types.ObjectId) {
		return (await View.findOne({ productId: productId }).exec())
			? true
			: false;
	}

	public static async getViews(productId: Types.ObjectId) {
		const views = await View.findOne({ productId: productId }).exec();
		return views?.viewsCount;
	}

	public static async mostViewed(offset:number, limit:number) {
		const products = await View.find()
			.sort({ viewsCount: -1, productId: 1 })
			.select(["productId", "viewsCount"])
			.populate("productId")
			.skip(offset)
			.limit(limit)
			.exec();
		return products;
	}
}
