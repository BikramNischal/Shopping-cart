
import { Router } from "express";
import UserController from "../controllers/usercontroller";
import WishlistController from "../controllers/wishlistController";
import { validateToken } from "../auth/jwtUtils";

const wishlistRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Wishlist:
 *       type: object
 *       required:
 *         - userId
 *         - products 
 *       properties:
 *         userId:
 *           type: string
 *           description:  User id of associated user
 *         products:
 *           type: array
 *           items:
 *             type: string
 *           description: productId list
 *       example:
 *         userId: 2342354979723423
 *         products: [ 235346635356436,2543505203589, 804385030945]
 *
 *     ProductReq:
 *       type: object
 *       required:
 *         - productId
 *       properties:
 *         productId:
 *           type: number
 *           description: productId list
 *       example:
 *         productId: 2
 */

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Wishlist Managing API
 * 
 * /user/wishlist:
 *   get:
 *     summary: Get list of products in wishlist
 *     tags: [Wishlist]
 *     responses:
 *       200:
 *         description: Product List.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string 
 *       401:
 *         description: User Not Logged In
 *       500:
 *         description: Some server error
 *
 * /user/wishlist/add:
 *   post:
 *     summary: Add items to wishlist
 *     tags: [Wishlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductReq'
 *     responses:
 *       200:
 *         description: Product successfully add to wishlist
 *       400:
 *         description: User Not Logged in
 *       404:
 *         description: Product Not Found For Given Id
 *       500:
 *         description: Some server error
 *
 * /user/wishlist/delete/{productId}:
 *   delete:
 *     summary: Delete product from wishlist
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: number
 *         required: true
 *         description: product id
 *     responses:
 *       200:
 *         description: Product successfully deleted from wishlist
 *       400:
 *         description: User Not Logged in
 *       404:
 *         description: Product Not Found For Given Id
 *       406:
 *         description: No such product in wishlist
 *       500:
 *         description: Some server error
 *
 */

wishlistRouter.get("/", validateToken, WishlistController.wishlist);

wishlistRouter.post("/add", validateToken, WishlistController.addToWishlist);

wishlistRouter.delete(
	"/delete/:productId",
	validateToken,
	WishlistController.removeFromWishlist
);

export default wishlistRouter;
