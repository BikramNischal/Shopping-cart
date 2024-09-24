import { Schema, model } from "mongoose";

export interface IProduct {
	id: number;
	name: string;
	details: string;
	price: number;
	tags: string[];
}

const productSchema = new Schema<IProduct>({
	id: { type: Number, required: true, unique: true },
	name: { type: String, required: true },
	details: { type: String },
	price: { type: Number, required: true },
	tags: { type: [String] },
});

export const Product = model<IProduct>("Product", productSchema);
