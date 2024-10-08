import { User } from "../models/user";
import { Cart } from "../models/cart";
import { Request, Response } from "express";
import { httpLogger } from "../logger/logger";
import { generateToken } from "../auth/jwtUtils";
import { Wishlist } from "../models/wishlist";
import { getUserAgent } from "../utils/userAgent";
import AccountActivityController from "./accountActivityController";

export default class UserController {
	// create user with given name
	public static async createUser(req: Request, res: Response) {
		const newUserCart = new Cart({ products: [] });
		if (req.body.username && req.body.passwd) {
			const newUser = new User({
				name: req.body.username,
				passwd: req.body.passwd,
				role: req.body.role.toLowerCase() ?? "user",
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
					userid: "anonymous",
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

			res.cookie("token", token, { maxAge: 12 * 60 * 60 * 1000 });
			res.cookie("userId", newUser._id, { maxAge: 12 * 60 * 60 * 1000 });
			res.json(newUser);

			httpLogger.log("info", {
				message: "User Created",
				userid: newUser._id,
				user: newUser.role,
				req,
				res,
			});
		} else {
			res.status(400).send("username or password not defined");

			httpLogger.log("error", {
				message: "Username or Password not defined!",
				userid: "anonymous",
				req,
				res,
				user: "anonymous",
			});
		}
	}

	// delete user with given id
	public static async deleteUser(req: Request, res: Response) {
		const user = await User.findById(req.cookies.userId).exec();

		if (user?.role === "admin") {
			try {
				const userToDelete = await User.findById(req.body.userId);
				// delete cart associated with the user
				await Cart.findByIdAndDelete(userToDelete?.cartId).exec();

				//delete wishlist associated with the user
				await Wishlist.findOneAndDelete({ userId: userToDelete?._id });

				// delete user
				await User.findByIdAndDelete(req.body.userId).exec();
				res.send(`User ${userToDelete?._id} deleted`);

				httpLogger.log("info", {
					message: `User ${userToDelete?._id} Deleted`,
					user: user?.role,
					userid: req.cookies.userId,
					req,
					res,
				});
			} catch (err) {
				httpLogger.log("error", {
					message: (err as Error).message,
					userid: req.cookies.userId,
					req,
					res,
					user: user?.role,
				});
			}
		} else {
			res.status(403).json({
				message: "Forbidden Operation: Not Enough Permission!",
			});

			httpLogger.log("error", {
				message: "Forbidden Operation: Not Enough Permission!",
				userid: req.cookies.userId,
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
				message: "Access Denied: Insufficient Permission!",
			});

			httpLogger.log("error", {
				message: "Access Denied: Insufficient Permission!",
				userid: req.cookies.userId,
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
				userid: req.cookies.userId,
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
		const user = await getUserAgent(req);

		try {
			const userData = await User.findById(req.cookies.userId)
				.populate("cartId")
				.populate("checkouts")
				.exec();

			res.json(userData);

			httpLogger.log("info", {
				message: "Success",
				userid: req.cookies.userId,
				user: user,
				req,
				res,
			});
		} catch (err) {
			httpLogger.log("error", {
				message: (err as Error).message,
				userid: req.cookies.userId,
				req,
				res,
				user: user,
			});
		}
	}

	// user login and add cookie entry for user
	public static async userLogin(req: Request, res: Response) {
		try {
			const user = await User.findOne({
				name: req.body.username,
			}).exec();

			if (user) {
				let accessAccount =
					await AccountActivityController.getAccountActivity(
						user._id
					);
				if (accessAccount && !accessAccount.active) {
					res.status(401).json({
						success: false,
						message: "Account Locked!",
					});

					httpLogger.log("error", {
						message: "Account Locked",
						user: user.role,
						userid: user._id,
						req,
						res,
					});
					return;
				}

				if (user.passwd === req.body.passwd) {
					const token = generateToken({
						username: user.name,
						id: user._id,
						role: user.role,
					});
					res.cookie("token", token, { maxAge: 12 * 60 * 60 * 1000 });
					res.cookie("userId", user._id, {
						maxAge: 12 * 60 * 60 * 1000,
					});

					// reset previous failed login attempts 
					if (accessAccount)
						AccountActivityController.resetAttempts(
							accessAccount._id
						);

					res.status(200).json({
						success: true,
						message: "Login Successful!",
					});

					httpLogger.log("info", {
						message: "User Login Successful",
						user: user.role,
						userid: user._id,
						req,
						res,
					});
				} else {
					let accountActivity =
						(await AccountActivityController.getAccountActivity(
							user._id
						)) ??
						(await AccountActivityController.createActivity(
							user._id
						));

					if (accountActivity?.attempts! > 2) {
						await AccountActivityController.lockAccount(
							accountActivity?._id!
						);
						res.status(401).json({
							success: false,
							message:
								"Incorrect Password: Exceeded Maximum Attempts - Account Locked!",
						});
					} else {
						await AccountActivityController.incrementAttempt(
							accountActivity?._id!
						);
						res.status(401).json({
							success: false,
							message: "Incorrect Password",
						});
					}
				}
			} else {
				res.status(404).send("User Not Found");
				httpLogger.log("error", {
					message: "User Not Found!",
					userid: "anonymous",
					req,
					res,
					user: "anonymous",
				});
			}
		} catch (err) {
			httpLogger.log("error", {
				message: (err as Error).message,
				userid: "anonymous",
				req,
				res,
				user: "anonymous",
			});
		}
	}

	//get otp
	public static async getOtp(req: Request, res: Response) {
		try {
			const user = await User.findOne({ name: req.body.username }).exec();
			if (user) {
				const accountActivity =
					await AccountActivityController.getAccountActivity(
						user._id
					);
				if (accountActivity && !accountActivity.active) {
					const otp = await AccountActivityController.getOtp(
						accountActivity._id
					);
					res.status(200).json({
						success: true,
						message: `Your OTP is ${otp}`,
					});
				} else {
					res.status(200).json({
						success: true,
						message: `Your Account is not locked`,
					});
				}
			}
		} catch (err) {
			console.log((err as Error).message);
		}
	}

	//unlock account
	public static async unlockUser(req: Request, res: Response) {
		try {
			const user = await User.findOne({ name: req.body.username }).exec();
			if (user) {
				const unclocked = await AccountActivityController.unlockAccount(
					user._id,
					req.body.otp
				);
				if (unclocked) {
					res.status(200).json({
						success: true,
						message: "Account Unlocked!",
					});
				} else {
					res.status(401).json({
						success: false,
						message: "Incorrect Otp",
					});
				}
			} else {
				res.status(401).json({
					success: false,
					message: "User Not Found",
				});
			}
		} catch (err) {
			console.log((err as Error).message);
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
			userid: user?._id,
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
					userid: req.cookies.userId,
					req,
					res,
				});
			} else {
				res.send("No items in cart to checkout!");
				httpLogger.log("warn", {
					message: "Warning",
					userid: req.cookies.userId,
					user: user?.role,
					req,
					res,
				});
			}
		} catch (err) {
			console.error(err);

			httpLogger.log("error", {
				message: "User Not Found!",
				userid: req.cookies.userId,
				req,
				res,
				user: user?.role ?? "anonymous",
			});
		}
	}

	// return a detail list of all products in checkouts
	public static async checkoutList(req: Request, res: Response) {
		const user = await getUserAgent(req);

		try {
			const userData = await User.findById(req.cookies.userId)
				.populate("checkouts")
				.exec();
			res.json(userData?.checkouts);

			httpLogger.log("info", {
				message: "Success",
				userid: req.cookies.userId,
				user: user,
				req,
				res,
			});
		} catch (err) {
			httpLogger.log("error", {
				message: "User Not Found!",
				userid: req.cookies.userId,
				req,
				res,
				user: user,
			});
		}
	}
}
