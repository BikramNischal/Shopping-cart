import mongoose, { Schema, model, ObjectId } from "mongoose";
// import { IProduct } from "./product";


export interface ICart{
    products: mongoose.Types.ObjectId[];
};

const cartSchema = new Schema<ICart>({
    products: [{type: Schema.Types.ObjectId, ref:"Product"}]
});


export const Cart = model<ICart>("Cart", cartSchema);