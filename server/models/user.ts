import mongoose, {Schema, model, PopulatedDoc} from "mongoose";
import {ICart} from "./cart";
import { IProduct, Product } from "./product";

export interface IUser{
    name: string;
    id: number;
    cartId: PopulatedDoc<ICart>;
    checkouts: mongoose.Types.ObjectId[];
};

const userSchema = new Schema<IUser>({
    id: {type: Number, required: true},
    name: {type: String, required: true},
    cartId: {type: Schema.Types.ObjectId, ref:"Cart"},
    checkouts:[{type: Schema.Types.ObjectId, ref:"Product"}]
});

export const User = model<IUser>("User", userSchema);

