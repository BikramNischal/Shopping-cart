import mongoose, { Schema, model } from "mongoose";


export interface ICart{
    products: mongoose.Types.ObjectId[];
};

const cartSchema = new Schema<ICart>({
    products: [{type: Schema.Types.ObjectId, ref:"Product"}]
});


export const Cart = model<ICart>("Cart", cartSchema);