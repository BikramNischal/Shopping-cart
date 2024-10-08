import mongoose, { Schema, model, PopulatedDoc } from "mongoose";
import { ICart } from "./cart";

export interface IUser {
	name: string;
	passwd: string;
	role: string;
	email: string;
	googleId: string;
	githubId: string;
	cartId: PopulatedDoc<ICart>;
	checkouts: mongoose.Types.ObjectId[];
}

export interface IAuthUser extends IUser{
	_id: string;
}

const userSchema = new Schema<IUser>({
	passwd: { type: String},
	name: { type: String, required: true, unique: true },
	role: {
		type: String,
		enum: ["anonymous", "user", "admin"],
		default: "user",
		required: true,
	},
	email: { type: String, unique: true },
	googleId: { type: String },
	githubId: { type: String },
	cartId: { type: Schema.Types.ObjectId, ref: "Cart" },
	checkouts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
});

export const User = model<IUser>("User", userSchema);
