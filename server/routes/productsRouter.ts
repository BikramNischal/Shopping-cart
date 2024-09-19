import { Router } from "express";
import ProductController from "../controllers/productcontroller";
import { validateToken } from "../auth/jwtUtils";
import { upload } from "../utils/multerConfig";

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
 *         - tags
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
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: keywords for product 
 *       example:
 *         id: 1
 *         name: keyboard 
 *         details: mechanical keyboard with blue switch 
 *         price: 5000
 *         tags: ["keyboard", "mechanical"]
 *     Search:
 *       type: object
 *       require:
 *         - searchKey
 *       properties:
 *         searchKey:
 *           type: string
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
 * /products/create:
 *   post:
 *     summary: Create New Product 
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product Details. 
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       403:
 *         description: Permission Denied 
 *       500:
 *         description: Some server error
 *
 * /products/search:
 *   post:
 *     summary: Search Product for given keyword 
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Search'
 *     responses:
 *       200:
 *         description: Product Details. 
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product Not Found For Given keyword
 *       500:
 *         description: Some server error
 * 
 * /products/addimage/{productId}:
 *   post:
 *     summary: Search Product for given keyword 
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: number
 *         required: true
 *         description: product id
 *     requestBody:
 *       required: true
 *       content:
 *         image/png:
 *           schema:
 *             type: string
 *             format: binary
 *         image/jpg:
 *           schema:
 *             type: string
 *             format: binary
 *         image/jpeg:
 *           schema:
 *             type: string
 *             format: binary
 *     responses:
 *       200:
 *         description: Product Details. 
 *         content:
 *           application/json:
 *             schema:
 *               Responese:
 *                 type: object
 *                 required:
 *                   - success
 *                   - message
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     description: request status
 *                   message:
 *                     type: string
 *                     description: request status message 
 * 
 *       403:
 *         description: Permission Denied 
 *       500:
 *         description: Some server error
 *
 *
 */

productRouter.get("/", ProductController.products);

productRouter.get("/:productId", ProductController.productDetail);

productRouter.post("/create", validateToken, ProductController.createProduct)

productRouter.post("/search", ProductController.search);

productRouter.post("/addimage/:productId", upload.single("image"), ProductController.addImage);


export default productRouter;
