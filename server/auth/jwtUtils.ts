import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { httpLogger } from "../logger/logger";

export interface Payload {
	username: string;
	id: Types.ObjectId;
	role: string;
}

const options = {
	expiresIn: "3h",
};

export function generateToken(payload: Payload) {
	const secretkey = process.env.JWT_SECRET as string;
	return jwt.sign(payload, secretkey, options);
}

export function validateToken(req: Request, res: Response, next: NextFunction) {
	if (!req.cookies.token) {
		res.status(401).send("User Not Logged In!");

		httpLogger.log("error", {
			message: "User Not Logged In!",
			req,
			res,
			user: "anonymous",
		});
		return;
	}

	try {
		const payload: JwtPayload = jwt.verify(
			req.cookies.token,
			process.env.JWT_SECRET as string
		) as JwtPayload;
		res.cookie("userId", payload.id);
		next();
	} catch (err) {
		res.status(401).json({
			success: false,
			message: "Invalid Token!",
			error: (err as Error).message,
		});

		httpLogger.log("error", {
			message:(err as Error).message,
			req,
			res,
			user: "anonymous",
		});
		next(err);
	}
}
