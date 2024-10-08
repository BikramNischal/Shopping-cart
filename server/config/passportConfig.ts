import "dotenv/config";
import passport from "passport";
import {
	Strategy as GitHubStrategy,
	Profile as GitHubProfile,
} from "passport-github2";
import {
	Strategy as GoogleStrategy,
	Profile as GoogleProfile,
} from "passport-google-oauth20";
import { User } from "../models/user";
import createUser from "../services/createUser";

passport.use(
	new GitHubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
			callbackURL: process.env.GITHUB_CLIENT_URL as string,
		},

		async (
			accessToken: string,
			refreshToken: string,
			profile: GitHubProfile,
			done: any
		) => {
			let user = await User.findOne({ githubId: profile.id });
			if (!user) {
				user = createUser(
					profile.username as string,
					null,
					"user",
					null,
					null,
					profile.id
				);
				await user.save();
			}
			return done(null, user);
		}
	)
);

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			callbackURL: process.env.GOOGLE_CLIENT_URL as string,
		},
		async (
			accessToken: string,
			refreshToken: string,
			profile: GoogleProfile,
			done: any
		) => {
			let user = await User.findOne({ googleId: profile.id });
			if (!user) {
				user = createUser(
					profile._json.name as string,
					null,
					"user",
					profile._json.email as string,
					profile.id,
					null,
				);
				await user.save();
			}
			return done(null, user);
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user!);
});
