import "dotenv/config";
import express, {Express, Request, Response} from "express";
import mongoose from "mongoose";

import {product, productDetail} from "./controllers/productcontroller";
import { checkout, checkoutList, createUser, deleteUser, userDetails, userList, userLogin, userLogout } from "./controllers/usercontroller";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
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
app.use(cookieParser());

app.get("/", (req:Request, res: Response) => {
    res.send("Hello World");
})


// Product routing 
app.get("/products/", product);

app.get("/products/:productId", productDetail);


// user routing
app.get("/users", userList);

app.get("/user/logout", userLogout);

app.get("/user", userDetails);

app.post("/user/create",  createUser);

app.delete("/user/delete", deleteUser);

app.post("/user/login", userLogin);


// cart routing
app.get("/user/cart", cartList);

app.post("/user/cart/add", addToCart);

app.delete("/user/cart/:productId", removeFromCart);

app.get("/user/checkout", checkoutList);

app.post("/user/cart/checkout", checkout);

app.listen(port , () => {
    console.log(`Listening to port: ${port}`);
})