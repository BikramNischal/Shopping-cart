import mongoose, { Schema, model } from "mongoose";

export interface IView {
	productId: mongoose.Types.ObjectId;
	views: mongoose.Types.ObjectId[];
	viewsCount: number;
}

const viewSchema = new Schema<IView>({
	productId: { type: Schema.Types.ObjectId, ref: "Product" },
	views: [{ type: Schema.Types.ObjectId, ref: "User" }],
	viewsCount: { type: Number },
});

export const View = model<IView>("View", viewSchema);
