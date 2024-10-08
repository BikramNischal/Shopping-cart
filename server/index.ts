import "dotenv/config";
import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import path from "path";
import passport from "passport";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";

import swaggerUi from "swagger-ui-express";
import { specs } from "./utils/swagger";

import productRouter from "./routes/productsRouter";
import userRouter from "./routes/userRouter";
import cartRouter from "./routes/cartRouter";
import wishlistRouter from "./routes/wishlistRouter";
import authRouter from "./routes/authRoutes";
import sessionMiddleware from "./utils/sessionMiddleware";

mongoose.set("strictQuery", false);

const dburl = process.env.DB_URL as string;
const port = process.env.PORT;

// DB connection
async function dbConnection() {
	await mongoose.connect(dburl);
	console.log("connected successfully!");
}
dbConnection().catch((err) => console.error(err));

const app: Application = express();

app.use(sessionMiddleware);

// parser middleware
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

// ceate a rotating write stream
const accessLogStream = createStream("access.log", {
	interval: "1d",
	path: path.join(__dirname, "logs"),
});

// morgan config
const morganFormat =
	":date :method :url :status :res[content-length] - :response-time ms";
app.use(morgan(morganFormat, { stream: accessLogStream }));

// passport setup
app.use(passport.initialize());
app.use(passport.session());

import "./config/passportConfig";

// app routes
app.get("/", (req: Request, res: Response) => {
	res.send("Home Page");
});
app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/user", userRouter);
app.use("/user/cart", cartRouter);
app.use("/user/wishlist", wishlistRouter);

app.use(
	"/api/docs",
	swaggerUi.serve,
	swaggerUi.setup(specs, { explorer: true })
);

app.listen(port, () => {
	console.log(`Listening to port: ${port}`);
});
