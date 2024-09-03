import { Request, Response } from "express";
import { User } from "../models/user";
import { Cart } from "../models/cart";
import { Product } from "../models/product";

// return cart list
export async function cartList(req: Request, res: Response) {	
	if (!req.cookies.userId) {
		res.status(400).send("User Not Logged In!");
	}
	const user = await User.findOne({ id: req.cookies.userId }).exec();
		const cart = await Cart.findById(user?.cartId).populate("products").exec();
		res.json(cart?.products);
}

export async function addToCart(req: Request, res: Response) {
	if (!req.cookies.userId) {
		res.status(400).send("User Not Logged In!");
	}

	const user = await User.findOne({ id: req.cookies.userId }).exec();
	const product = await Product.findOne({ id: req.body.productId }).exec();

	if (user && product) {
		const cart = await Cart.findById(user.cartId).exec();
		if (cart) {
			cart.products.push(product._id);
			await cart.save();
			res.send(`product id : ${product.id} is added to cart`);
		}
	} else {
		res.status(404);
		const msg = user ? "Product Not Found" : "User Not Found!";
		res.send(msg);
	}
}

export async function removeFromCart(req: Request, res: Response) {

	if (!req.cookies.userId) {
		res.status(400).send("User Not Logged In!");
	}

	const user = await User.findOne({ id: req.cookies.userId }).exec();
	const product = await Product.findOne({ id: req.params.productId }).exec();

	if (user && product) {
		const cart = await Cart.findById(user.cartId).exec();
		const index : number = cart?.products.indexOf(product._id) as number;

		if(index >= 0){
			cart?.products.splice(index,1);
			await cart?.save();
			res.send(`Product Id: ${product.id} Removed From Cart`);
		} else {
			res.status(400);
			res.send("No such product on cart");
		}

	} else {
		const msg = user
			? `Product with id ${req.params.productId} Not Found`
			: `User with id ${req.params.userId} Not Found`;
		res.status(404);
		res.send(msg);
	}
}
