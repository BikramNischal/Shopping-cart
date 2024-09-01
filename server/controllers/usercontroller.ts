import { User } from "../models/user";
import { Cart } from "../models/cart";
import { Request, Response } from "express";

// create user with given name
export async function createUser(req: Request, res: Response) {
	const userCount = await User.countDocuments().exec();
	const newUserCart = new Cart({ products: [] });

	if (req.body.username) {
		const newUser = new User({
			id: userCount + 1,
			name: req.body.username,
			cartId: newUserCart._id,
			checkouts: [],
		});

		// save db changes
		await newUserCart.save();
		await newUser.save();
		console.log("User Created");
		res.json(newUser);
	} else {
		res.status(400);
		res.send("username not found");
	}
}

// delete user with given id
export async function deleteUser(req: Request, res: Response) {
	const user = await User.findOne({ id: req.params.userId }).exec();
	if (user) {
		// delete cart associated with the user
		const cart = await Cart.findByIdAndDelete(user.cartId);

		// delete user
		await User.deleteOne({ id: req.params.userId }).exec();

		res.send(`User ${user.id} deleted`);
	} else {
		res.sendStatus(404);
	}
}

// get all users
export async function userList(req: Request, res: Response) {
	const users = await User.find({}).exec();
	res.json(users);
}

// checkout
export async function checkout(req: Request, res: Response) {
	const user = await User.findOne({ id: req.params.userId }).exec();

	if (user) {
		const cart = await Cart.findById(user.cartId).exec();

		if (cart?.products.length) {
			// insert products into checkout and empty the cart
			let productId = cart?.products.shift();
			while (productId) {
				user.checkouts.push(productId);
				productId = cart?.products.shift();
			}

			// save the db changes
			await user.save();
			await cart?.save();

			res.send("cart items add to checkout!");
		} else {
			res.send("No items in cart to checkout!");
		}


	} else {
		res.status(404);
		res.send("User Not Found!");
	}
}

export async function checkoutList(req: Request, res: Response) {
	const user = await User.findOne({ id: req.params.userId }).exec();

	if (user) {
		const userData = user.populate("checkouts");
		res.json((await userData).checkouts);
	} else {
		res.status(404);
		res.send("User Not Found!");
	}
}
