import "dotenv/config";
import express, {Express, Request, Response} from "express";
import mongoose from "mongoose";

import {product, productDetail} from "./controllers/productcontroller";
import { checkout, checkoutList, createUser, deleteUser, userList } from "./controllers/usercontroller";
import bodyParser from "body-parser";
import { addToCart, cartList, removeFromCart} from "./controllers/cartcontroller";


mongoose.set("strictQuery", false);

const dburl = process.env.DB_URL as string;
const port = process.env.PORT ;

async function dbConnection() { 
    await mongoose.connect(dburl);
    console.log("connected successfully!");
}

dbConnection().catch( err => console.error(err));


const app: Express =  express();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get("/", (req:Request, res: Response) => {
    res.send("Hello World");
})


// Product routing 
// get product list 
app.get("/products/", product);

// get product details 
app.get("/products/:productId", productDetail);


// user routing
// get all users
app.get("/user", userList);

// create user for give req.body.username
app.post("/user",  createUser);

// delete user
app.delete("/user/:userId", deleteUser);


// cart routing
//get cart list 
app.get("/user/:userId/cart", cartList);

// add to cart 
app.post("/user/:userId/cart/add", addToCart);

// remove item from cart 
app.delete("/user/:userId/cart/:productId", removeFromCart);

// checkout products list
app.get("/user/:userId/cart/checkout", checkoutList);

// checkout
app.post("/user/:userId/cart/checkout", checkout);

app.listen(port , () => {
    console.log(`Listening to port: ${port}`);
})