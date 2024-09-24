import mongoose, { Schema, model } from "mongoose";

interface IImage {
	productId: mongoose.Types.ObjectId;
	images: string[];
}

const imageSchema = new Schema<IImage>({
	productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
	images: [{ type: String, required: true }],
});

export const Image = model<IImage>("Image", imageSchema);
