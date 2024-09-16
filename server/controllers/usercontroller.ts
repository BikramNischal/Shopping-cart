import { User } from "../models/user";
import { Cart } from "../models/cart";
import { Request, Response } from "express";
import { httpLogger } from "../logger/logger";
import { generateToken, validateToken } from "../auth/jwtUtils";
import { JwtPayload } from "jsonwebtoken";

export default class UserController {
	// create user with given name
	public static async createUser(req: Request, res: Response) {
		const newUserCart = new Cart({ products: [] });
		if (req.body.username && req.body.passwd) {
			const newUser = new User({
				name: req.body.username,
				passwd: req.body.passwd,
				role: req.body.role ?? "user",
				cartId: newUserCart._id,
				checkouts: [],
			});

			// save db changes
			try {
				await newUserCart.save();
				await newUser.save();
			} catch (err) {
				httpLogger.log("error", (err as Error).message, { req, res });
			}
			const token = generateToken({
				username: newUser.name,
				id: newUser._id,
				role: newUser.role,
			});
			res.cookie("token", token);
			res.cookie("userId", newUser._id);
			res.json(newUser);
			httpLogger.log("info", "User Created", { req, res });
		} else {
			res.status(400).send("username or password not defined");
			httpLogger.log("error", "username or password undefined", {
				req,
				res,
			});
		}
	}

	// delete user with given id
	public static async deleteUser(req: Request, res: Response) {
		try {
			const user = await User.findById(req.cookies.userId).exec();
			// delete cart associated with the user
			const cart = await Cart.findByIdAndDelete(user?.cartId);
			// delete user
			await User.findByIdAndDelete(req.cookies.userId).exec();
			res.clearCookie("userId");
			res.clearCookie("token");
			res.send(`User ${user?._id} deleted`);
			httpLogger.log("info", "User Deleted", { req, res });
		} catch (err) {
			httpLogger.log("error", (err as Error).message, { req, res });
			console.log(err);
		}
	}

	// get all users
	public static async userList(req: Request, res: Response) {
		const user = await User.findById(req.cookies.userId);

		if (user?.role.toLowerCase() !== "admin") {
			res.status(403).json({
				success: false,
				message: "Insufficient Permission!",
			});
			httpLogger.log("error", "Insufficient Permission!", { req, res });
			return;
		}

		try {
			const users = await User.find({}).exec();
			res.json(users);
			httpLogger.log("info", "Success", { req, res });
		} catch (err) {
			console.error(err);
			httpLogger.log("error", (err as Error).message, { req, res });
		}
	}

	// get user details
	public static async userDetails(req: Request, res: Response) {
		try {
			const user = await User.findById(req.cookies.userId)
				.populate("cartId")
				.populate("checkouts")
				.exec();
			res.json(user);
			httpLogger.log("info", "Success", { req, res });
		} catch (err) {
			console.error(err);
			httpLogger.log("error", (err as Error).message, { req, res });
		}
	}

	// user login and add cookie entry for user
	public static async userLogin(req: Request, res: Response) {
		try {
			const user = await User.findOne({ name: req.body.username }).exec();
			if (user) {
				if (req.body.passwd === user.passwd) {
					const token = generateToken({
						username: user.name,
						id: user._id,
						role: user.role,
					});
					res.cookie("token", token);
					res.cookie("userId",user._id);
					res.json({
						success: true,
						message: "Login Successful!",
					});
					httpLogger.log("info", "User Login", { req, res });
				} else {
					res.status(400).json({
						success: false,
						message: "Incorrect password!",
					});
					httpLogger.log("error", "Incorrect password", { req, res });
				}
			} else {
				res.status(404).send(`User: ${req.body.username} Not Found!`);
				httpLogger.log("error", "User Not Found", { req, res });
			}
		} catch (err) {
			console.error(err);
			httpLogger.log("error", (err as Error).message, { req, res });
		}
	}

	// delete cookies entry
	public static async userLogout(req: Request, res: Response) {
		res.clearCookie("userId");
		res.clearCookie("token");
		res.send("Logout Successful");
		httpLogger.log("info", "User Logout", { req, res });
	}

	// add all items in cart to checkouts and empty cart
	public static async checkout(req: Request, res: Response) {
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
				httpLogger.log("info", "cart items add to checkout!", {
					req,
					res,
				});
			} else {
				res.send("No items in cart to checkout!");
				httpLogger.log("info", "No items in cart to checkout!", {
					req,
					res,
				});
			}
		} catch (err) {
			console.error(err);
			httpLogger.log("error", (err as Error).message, { req, res });
		}
	}

	// return a detail list of all products in checkouts
	public static async checkoutList(req: Request, res: Response) {
		try {
			const user = await User.findById(req.cookies.userId)
				.populate("checkouts")
				.exec();
			res.json(user?.checkouts);
			httpLogger.log("info", "Success", { req, res });
		} catch (err) {
			console.error(err);
			httpLogger.log("error", (err as Error).message, { req, res });
		}
	}
}
