import { Router } from "express";
import UserController from "../controllers/userController";
import CartController from "../controllers/cartController";

const cartRouter = Router();


/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       required:
 *         - products 
 *       properties:
 *         products:
 *           type: array
 *           items:
 *             type: string
 *           description: productId list 
 *       example:
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
 *   name: Cart
 *   description: Cart Managing API 
 * /user/cart:
 *   get:
 *     summary: Get list of products in cart  
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Product List. 
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: User Not Logged In 
 *       500:
 *         description: Some server error
 * 
 * /user/cart/add:
 *   post:
 *     summary: Add items to cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductReq' 
 *     responses:
 *       200:
 *         description: Product successfully add to cart
 *       400:
 *         description: User Not Logged in 
 *       404:
 *         description: Product Not Found For Given Id
 *       500:
 *         description: Some server error
 * 
 * /user/cart/delete/{productId}:
 *   delete:
 *     summary: Delete product from cart 
 *     tags: [Cart]
 *     parameters:
 *      - in: path
 *        name: productId
 *        schema:
 *          type: number
 *        required: true
 *        description: product id
 *     responses:
 *       200:
 *         description: Product successfully deleted from cart
 *       400:
 *         description: User Not Logged in 
 *       404:
 *         description: Product Not Found For Given Id
 *       406:
 *         description: No such product in cart 
 *       500:
 *         description: Some server error
 * 
 * /user/cart/checkout/details:
 *   get:
 *     summary: List of checkout items 
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: List of checkout products 
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: string 
 *         example: [34324234,324234234,345345345]
 * 
 *       400:
 *         description: User Not Logged in 
 *       500:
 *         description: Some server error
 * 
 * /user/cart/checkout:
 *   post:
 *     summary: Checkout all items in cart 
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Items add to checkout  
 *       400:
 *         description: User Not Logged in 
 *       500:
 *         description: Some server error
 *
 *
 */

cartRouter.get("/", CartController.cartList);

cartRouter.post("/add", CartController.addToCart);

cartRouter.delete("/delete/:productId", CartController.removeFromCart);

cartRouter.get("/checkout/details", UserController.checkoutList);

cartRouter.post("/checkout", UserController.checkout);

export default cartRouter;
