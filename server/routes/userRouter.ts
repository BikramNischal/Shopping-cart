import { Router } from "express";
import UserController from "../controllers/usercontroller";
import { validateToken } from "../auth/jwtUtils";

const userRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - passwd
 *         - cartId
 *         - checkouts
 *       properties:
 *         name:
 *           type: string
 *           description: Name of User
 *         passwd:
 *           type: string
 *           description: Password for user 
 *         cartId:
 *           type: string
 *           description: Id of cart associated with user generated by mongodb
 *         checkouts:
 *           type: array
 *           description: array of prodcutId 
 *       example:
 *         name: user 
 *         passwd: password 
 *         cartId: 2490934571240420 
 *         checkouts: [23525254235624634,09823507230235,825082359095]
 *     UserLogin:
 *       type: object
 *       required:
 *         - username
 *         - passwd
 *       properties:
 *         username:
 *           type: string
 *           description: Name of User
 *         passwd:
 *           type: string
 *           description: Password for user 
 *     UserDelete:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           description: Id of User to be deleted
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User managing API
 * /user:
 *   get:
 *     summary: Lists all the users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 * 
 * /user/create:
 *   post:
 *     summary: Create a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: User Created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Some server error
 * 
 * /user/details:
 *   get:
 *     summary: Get the logged in user details
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Current Logged In User
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: User Not Logged In! 
 *         
 * /user/delete:
 *   delete:
 *     summary: Delete the current user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserDelete'
 *  
 *     responses:
 *       200:
 *         description: User with {userId} deleted
 *       400:
 *         description: User Not Logged In 
 * 
 * /user/login:
 *   post:
 *     summary: User Login  
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: User Login Successful.
 *       400:
 *         description: Incorrect Password 
 *       404:
 *         description: User Not Found 
 *       500:
 *         description: Some server error
 * 
 * /user/logout:
 *   get:
 *     summary: User logout 
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User Logout Successful.
 *       400:
 *         description: User Not Logged In! 
 */



// user routing
userRouter.post("/create", UserController.createUser);

userRouter.post("/login", UserController.userLogin);

userRouter.post("/unlock", UserController.unlockUser);

userRouter.post("/otp", UserController.getOtp);

userRouter.use(validateToken);

userRouter.get("/", UserController.userList);

userRouter.get("/details", UserController.userDetails);

userRouter.get("/logout", UserController.userLogout);

userRouter.delete("/delete", UserController.deleteUser);


export default userRouter;
