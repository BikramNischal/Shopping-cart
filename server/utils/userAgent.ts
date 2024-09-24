import { Request } from "express";
import { User } from "../models/user";

export async function getUserAgent(req: Request): Promise<string> {
	const userAgent: string = req.cookies.userId
		? ((await User.findById(req.cookies.userId).exec())?.role as string)
		: "anonymous";
 
    return userAgent;
}
