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
			passwd: req.body.passwd,
			cartId: newUserCart._id,
			checkouts: [],
		});

		// save db changes
		await newUserCart.save();
		await newUser.save();

		res.cookie("userId", newUser.id);

		res.json(newUser);
	} else {
		res.status(400);
		res.send("username not found");
	}
}

// delete user with given id
export async function deleteUser(req: Request, res: Response) {
	if (!req.cookies.userId) {
		res.status(400).send("User Not Logged In!");
	}

	const user = await User.findOne({ id: req.cookies.userId }).exec();
	// delete cart associated with the user
	const cart = await Cart.findByIdAndDelete(user?.cartId);
	// delete user
	await User.deleteOne({ id: req.cookies.userId }).exec();
	res.clearCookie("userId");
	res.send(`User ${user?.id} deleted`);
}

// get all users
export async function userList(req: Request, res: Response) {
	const users = await User.find({}).exec();
	res.json(users);
}

// get user details
export async function userDetails(req: Request, res: Response) {
	if (!req.cookies.userId) {
		res.status(400).send("User Not Logged In!");
	}

	const user = await User.findOne({ id: req.cookies.userId })
		.populate("cartId")
		.populate("checkouts")
		.exec();

	if (user) {
		res.json(user);
	} else {
		res.status(404).send(`User Id: ${req.cookies.userId} Not Found!`);
	}
}

// user login and add cookie entry for user
export async function userLogin(req: Request, res: Response) {
	const user = await User.findOne({ id: req.body.userId }).exec();

	if (user) {
		if (req.body.passwd === user.passwd) {
			res.cookie("userId", user.id);
			res.send("Login Successful!");
		} else {
			res.status(400).send("Incorrect password!");
		}
	} else {
		res.status(404).send(`User Id: ${req.body.userId} Not Found!`);
	}
}

// delete cookies entry
export async function userLogout(req: Request, res: Response) {
	if (req.cookies.userId) {
		res.clearCookie("userId");
		res.send("Logout Successful");
	} else {
		res.status(400).send("User Not Logged In!");
	}
}

// add all items in cart to checkouts and empty cart
export async function checkout(req: Request, res: Response) {
	if (!req.cookies.userId) {
		res.status(400).send("User Not Logged In!");
	}

	const user = await User.findOne({ id: req.cookies.userId }).exec();
	const cart = await Cart.findById(user?.cartId).exec();

	if (cart?.products.length) {
		// insert products into checkout and empty the cart
		let productId = cart?.products.shift();
		while (productId) {
			user?.checkouts.push(productId);
			productId = cart?.products.shift();
		}

		// save the db changes
		await user?.save();
		await cart?.save();

		res.send("cart items add to checkout!");
	} else {
		res.send("No items in cart to checkout!");
	}
}

// return a detail list of all products in checkouts
export async function checkoutList(req: Request, res: Response) {
	if (!req.cookies.userId) {
		res.status(400).send("User Not Logged In!");
	}

	const user = await User.findOne({ id: req.cookies.userId })
		.populate("checkouts")
		.exec();
	res.json(user?.checkouts);
}
