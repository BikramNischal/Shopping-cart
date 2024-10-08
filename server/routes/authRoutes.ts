import { Router, Request, Response } from "express";
import passport from "passport";
import { generateToken } from "../auth/jwtUtils";
import { IAuthUser } from "../models/user";


const authRouter = Router();

authRouter.get(
	"/github",
	passport.authenticate("github", { scope: ["user:email"] })
);

authRouter.get(
	"/github/callback",
	passport.authenticate("github"),
	(req: Request, res: Response) => {
		const user = req.user as IAuthUser;
		const token = generateToken({
			username: user?.name,
			id: user?._id,
			role: user?.role,
		});

		res.cookie("token", token, { maxAge: 12 * 60 * 60 * 1000 });
		res.cookie("userId", user._id, { maxAge: 12 * 60 * 60 * 1000 });
		res.redirect("http://localhost:3000/auth/success");
	}
);

authRouter.get(
	"/google",
	passport.authenticate("google", {
		scope: ["email", "profile"],
	})
);

authRouter.get(
	"/google/callback",
	passport.authenticate("google"),
	(req: Request, res: Response) => {
		const user = req.user as IAuthUser;
		const token = generateToken({
			username: user?.name,
			id: user?._id,
			role: user?.role,
		});

		res.cookie("token", token, { maxAge: 12 * 60 * 60 * 1000 });
		res.cookie("userId", user._id, { maxAge: 12 * 60 * 60 * 1000 });
		res.redirect("http://localhost:3000/auth/success");
	}
);

authRouter.get("/success", (req: Request, res: Response) => {
	res.status(200).json(req.user);
});

authRouter.get("/error", (req: Request, res: Response) => {
	res.status(500).send("Some Error Occured");
});
export default authRouter;
