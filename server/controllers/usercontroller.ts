import { User } from "../models/user";
import { Cart } from "../models/cart";
import { Request, Response } from "express";

export default class UserController {
	// create user with given name
	public static async createUser(req: Request, res: Response) {
		const newUserCart = new Cart({ products: [] });

		if (req.body.username) {
			const newUser = new User({
				name: req.body.username,
				passwd: req.body.passwd,
				cartId: newUserCart._id,
				checkouts: [],
			});

			// save db changes
			try {
				await newUserCart.save();
				await newUser.save();
			} catch (err) {
				console.error(err);
			}
			res.cookie("userId", newUser._id);

			res.json(newUser);
		} else {
			res.status(400);
			res.send("username not found");
		}
	}

	// delete user with given id
	public static async deleteUser(req: Request, res: Response) {
		if (!req.cookies.userId) {
			res.status(400).send("User Not Logged In!");
		}

		try {
			const user = await User.findById(req.cookies.userId).exec();
			// delete cart associated with the user
			const cart = await Cart.findByIdAndDelete(user?.cartId);
			// delete user
			await User.findByIdAndDelete(req.cookies.userId).exec();
			res.clearCookie("userId");
			res.send(`User ${user?._id} deleted`);
		} catch (err) {
			console.error(err);
		}
	}

	// get all users
	public static async userList(req: Request, res: Response) {
		try {
			const users = await User.find({}).exec();
			res.json(users);
		} catch (err) {
			console.error(err);
		}
	}

	// get user details
	public static async userDetails(req: Request, res: Response) {
		if (!req.cookies.userId) {
			res.status(400).send("User Not Logged In!");
			return;
		}

		try {
			const user = await User.findById(req.cookies.userId)
				.populate("cartId")
				.populate("checkouts")
				.exec();
			res.json(user);
		} catch (err) {
			console.error(err);
		}
	}

	// user login and add cookie entry for user
	public static async userLogin(req: Request, res: Response) {
		try {
			const user = await User.findOne({ name: req.body.username }).exec();
			if (user) {
				if (req.body.passwd === user.passwd) {
					res.cookie("userId", user._id);
					res.send("Login Successful!");
				} else {
					res.status(400).send("Incorrect password!");
				}
			} else {
				res.status(404).send(`User Id: ${req.body.userId} Not Found!`);
			}
		} catch (err) {
			console.error(err);
		}
	}

	// delete cookies entry
	public static async userLogout(req: Request, res: Response) {
		if (req.cookies.userId) {
			res.clearCookie("userId");
			res.send("Logout Successful");
		} else {
			res.status(400).send("User Not Logged In!");
		}
	}

	// add all items in cart to checkouts and empty cart
	public static async checkout(req: Request, res: Response) {
		if (!req.cookies.userId) {
			res.status(400).send("User Not Logged In!");
		}
		try {
			const user = await User.findById(req.cookies.userId).exec();
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
		} catch (err) {
			console.error(err);
		}
	}

	// return a detail list of all products in checkouts
	public static async checkoutList(req: Request, res: Response) {
		if (!req.cookies.userId) {
			res.status(400).send("User Not Logged In!");
		}
		try {
			const user = await User.findById(req.cookies.userId)
				.populate("checkouts")
				.exec();
			res.json(user?.checkouts);
		} catch (err) {
			console.error(err);
		}
	}
}
