import { Router } from "express";

import ProductController from "../controllers/productcontroller";
import UserController from "../controllers/usercontroller";
import CartController from "../controllers/cartcontroller";

export const router = Router();

router.get("/", (req, res) => res.send("Hello World"));

// Product routing
router.get("/products/", ProductController.product);

router.get("/products/:productId", ProductController.productDetail);

// user routing
router.get("/users", UserController.userList);

router.post("/user/create", UserController.createUser);

router.get("/user", UserController.userDetails);

router.post("/user/login", UserController.userLogin);

router.get("/user/logout", UserController.userLogout);

router.delete("/user/delete", UserController.deleteUser);

// cart routing
router.get("/user/cart", CartController.cartList);

router.post("/user/cart/add", CartController.addToCart);

router.delete("/user/cart/:productId", CartController.removeFromCart);

router.get("/user/checkout", UserController.checkoutList);

router.post("/user/cart/checkout", UserController.checkout);


