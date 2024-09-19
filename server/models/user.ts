import mongoose, { Schema, model, PopulatedDoc } from "mongoose";
import { ICart } from "./cart";

export interface IUser {
	name: string;
	passwd: string;
	role: string;
	cartId: PopulatedDoc<ICart>;
	checkouts: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
	passwd: { type: String, required: true },
	name: { type: String, required: true, unique: true },
	role: {
		type: String,
		enum: ["anonymous", "user", "admin"],
		required: true,
	},
	cartId: { type: Schema.Types.ObjectId, ref: "Cart" },
	checkouts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
});

export const User = model<IUser>("User", userSchema);
