// insert dummy data to the products collection on monogdb

import { Product } from "./models/product";
import { Like } from "./models/likes";
import { View } from "./models/views";
import products from "./products.json";
import mongoose from "mongoose";
import "dotenv/config";

const dburl = process.env.DB_URL as string;

async function dbConnection() {
	await mongoose.connect(dburl);
	console.log("connected successfully!");
}

dbConnection().catch((err) => console.error(err));

async function Populate() {
	for (const product of products) {
		const newProduct = new Product(product);

		const newView = new View({
			productId: newProduct._id,
			views: [],
			viewsCount: 0,
		});

		const newLike = new Like({
			productId: newProduct._id,
			likes: [],
			likeCount: 0,
		});
		await newView.save();
		await newLike.save();
		await newProduct.save();
	}
}

// Populate()
// 	.then(() => {
// 		console.log("data inserterd!");
// 	})
// 	.catch((err) => console.error(err));
