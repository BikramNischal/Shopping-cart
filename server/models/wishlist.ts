import mongoose, {Schema, model} from "mongoose";


interface IWishlist{
    userId: mongoose.Types.ObjectId;
    products: mongoose.Types.ObjectId[];
}


const wishlistSchema = new Schema<IWishlist>({
    userId: {type: Schema.Types.ObjectId, required: true},
    products: [{type: Schema.Types.ObjectId, ref:"Product"}],
});

export const Wishlist = model<IWishlist>("Wishlist", wishlistSchema);