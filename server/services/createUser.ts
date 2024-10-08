import { User } from "../models/user";
import { Cart } from "../models/cart";

export default function createUser(
	username: string,
	passwd: string | null,
	role: string,
	email: string | null = null,
	googleId: string | null = null,
	githubId: string | null = null
) {
	const cart = new Cart({ products: [] });
	const user = new User({
		name: username,
		passwd: passwd,
		role: role,
		googleId: googleId,
		githubId: githubId,
		cartId: cart._id,
		checkouts: [],
	});

    if(email)
        user.email = email;


	return user;
}
