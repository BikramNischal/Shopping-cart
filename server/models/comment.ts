import mongoose, { Schema, model } from "mongoose";

interface IComment {
	productId: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	comment: string;
}

const commentSchema = new Schema<IComment>({
	productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
	userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
	comment: { type: String },
});

export const Comment = model<IComment>("Comment", commentSchema);
