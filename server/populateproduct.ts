
// insert dummy data to the products collection on monogdb

import { Product } from "./models/product";
import products from "./products.json";
import mongoose from "mongoose";
import "dotenv/config";

const dburl = process.env.DB_URL  as string;

async function dbConnection() {
	await mongoose.connect(dburl);
	console.log("connected successfully!");
}

dbConnection().catch((err) => console.error(err));

async function Populate() {
	for (const product of products) {
		const newProduct = new Product(product);
		await newProduct.save();
	}
}

// Populate()
// 	.then(() => {
// 		console.log("data inserterd!");
// 	})
// 	.catch((err) => console.error(err));
