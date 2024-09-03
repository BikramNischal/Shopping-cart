import {Schema, model} from "mongoose";

export interface IProduct {
    id: number;
    name: string;
    details: string;
    price: number;
};


const productSchema = new Schema<IProduct>({
    id: {type: Number, required: true, unique: true},
    name: {type: String, required: true},
    details: {type: String},
    price: {type: Number, required: true }
});

export const Product =  model<IProduct>("Product", productSchema);

