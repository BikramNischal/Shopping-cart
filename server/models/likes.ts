import mongoose, {Schema, model} from "mongoose";

export interface ILike{
    productId: mongoose.Types.ObjectId; 
    likes : mongoose.Types.ObjectId[];
    likeCount: number;
}


const likeSchema = new Schema<ILike>({
    productId: {type: Schema.Types.ObjectId, ref : "Product"},
    likes : [{type: Schema.Types.ObjectId, ref: "User"}],
    likeCount: {type: Number}
});

export const Like = model<ILike>("Like", likeSchema);