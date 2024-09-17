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
				httpLogger.log("error", {
					message: err.message as string,
					req,
					res,
					user: newUser.role,
				});
			}
			const token = generateToken({
				username: newUser.name,
				id: newUser._id,
				role: newUser.role,
			});

			res.cookie("token", token);
			res.cookie("userId", newUser._id);
			res.json(newUser);

			httpLogger.log("info", {
				message: "User Created",
				user: newUser.role,
				req,
				res,
			});
		} else {
			res.status(400).send("username or password not defined");

			httpLogger.log("error", {
				message: "Username or Password not defined!",
				req,
				res,
				user: "anonymous",
			});
		}
	}

	// delete user with given id
	public static async deleteUser(req: Request, res: Response) {
		const user = await User.findById(req.cookies.userId).exec();
		try {
			// delete cart associated with the user
			await Cart.findByIdAndDelete(user?.cartId);
			// delete user
			await User.findByIdAndDelete(req.cookies.userId).exec();
			res.clearCookie("userId");
			res.clearCookie("token");
			res.send(`User ${user?._id} deleted`);
			httpLogger.log("info", {
				message: "User Deleted",
				user: user?.role,
				req,
				res,
			});
		} catch (err) {
			httpLogger.log("error", {
				message: (err as Error).message,
				req,
				res,
				user: user?.role,
			});
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

			httpLogger.log("error", {
				message: "Insufficient Permission!",
				req,
				res,
				user: user?.role,
			});
			return;
		}

		try {
			const users = await User.find({}).exec();
			res.json(users);
			httpLogger.log("info", {
				message: "Success",
				user: user?.role,
				req,
				res,
			});
		} catch (err) {
			httpLogger.log("error", {
				message: (err as Error).message,
				req,
				res,
				user: user?.role,
			});
		}
	}

	// get user details
	public static async userDetails(req: Request, res: Response) {
		const user =
			(await User.findById(req.cookies.userId).exec())?.role ??
			"anonymous";

		try {
			const userData = await User.findById(req.cookies.userId)
				.populate("cartId")
				.populate("checkouts")
				.exec();

			res.json(userData);

			httpLogger.log("info", {
				message: "Success",
				user: user,
				req,
				res,
			});
		} catch (err) {
			httpLogger.log("error", {
				message: (err as Error).message,
				req,
				res,
				user: user,
			});
		}
	}

	// user login and add cookie entry for user
	public static async userLogin(req: Request, res: Response) {
		const user = await User.findOne({ name: req.body.username }).exec();
		try {
			if (user) {
				if (req.body.passwd === user.passwd) {
					const token = generateToken({
						username: user.name,
						id: user._id,
						role: user.role,
					});
					res.cookie("token", token);
					res.cookie("userId", user._id);
					res.json({
						success: true,
						message: "Login Successful!",
					});

					httpLogger.log("info", {
						message: "User Login Successful",
						user: user.role,
						req,
						res,
					});
				} else {
					res.status(400).json({
						success: false,
						message: "Incorrect password!",
					});
					httpLogger.log("error", {
						message: "Incorrect password!",
						req,
						res,
						user: user.role,
					});
				}
			} else {
				res.status(404).send(`User: ${req.body.username} Not Found!`);
				httpLogger.log("error", {
					message: "User Not Found!",
					req,
					res,
					user: "anonymous",
				});
			}
		} catch (err) {
			httpLogger.log("error", {
				message: "User Not Found!",
				req,
				res,
				user: user?.role ?? "anonymous",
			});
		}
	}

	// delete cookies entry
	public static async userLogout(req: Request, res: Response) {
		const user = await User.findById(req.cookies.userId).exec();

		res.clearCookie("userId");
		res.clearCookie("token");
		res.send("Logout Successful");

		httpLogger.log("info", {
			message: "User Logout Successful",
			user: user?.role,
			req,
			res,
		});
	}

	// add all items in cart to checkouts and empty cart
	public static async checkout(req: Request, res: Response) {
		const user = await User.findById(req.cookies.userId).exec();

		try {
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
				httpLogger.log("info", {
					message: "Success",
					user: user?.role,
					req,
					res,
				});
			} else {
				res.send("No items in cart to checkout!");
				httpLogger.log("warn", {
					message: "Warning",
					user: user?.role,
					req,
					res,
				});
			}
		} catch (err) {
			console.error(err);

			httpLogger.log("error", {
				message: "User Not Found!",
				req,
				res,
				user: user?.role ?? "anonymous",
			});
		}
	}

	// return a detail list of all products in checkouts
	public static async checkoutList(req: Request, res: Response) {
		const user =
			(await User.findById(req.cookies.userId).exec())?.role ??
			"anonymous";

		try {
			const userData = await User.findById(req.cookies.userId)
				.populate("checkouts")
				.exec();
			res.json(userData?.checkouts);

			httpLogger.log("info", {
				message: "Success",
				user: user,
				req,
				res,
			});
		} catch (err) {
			httpLogger.log("error", {
				message: "User Not Found!",
				req,
				res,
				user: user,
			});
		}
	}
}
