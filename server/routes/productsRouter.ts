import { Router } from "express";
import ProductController from "../controllers/productController";

const productRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - details
 *         - price
 *       properties:
 *         id:
 *           type: number
 *           description: provide by admin for navigation 
 *         name:
 *           type: string
 *           description: name of you product 
 *         details:
 *           type: string
 *           description: description of the prodcut 
 *         price:
 *           type: number
 *           description: price of the product 
 *       example:
 *         id: 1
 *         name: keyboard 
 *         details: mechanical keyboard with blue switch 
 *         price: 5000
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Products Managing API 
 * /products:
 *   get:
 *     summary: Get Products List 
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Product List. 
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       500:
 *         description: Some server error
 * 
 * /products/{productId}:
 *   get:
 *     summary: Get Product Details for given id 
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: number
 *         required: true
 *         description: product id
 *     responses:
 *       200:
 *         description: Product Details. 
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product Not Found For Given Id
 *       500:
 *         description: Some server error
 *
 */

productRouter.get("/", ProductController.products);
productRouter.get("/:productId", ProductController.productDetail);

export default productRouter;
