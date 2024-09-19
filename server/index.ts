import "dotenv/config";
import express, { Express} from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import path from "path";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";

import swaggerUi from "swagger-ui-express";
import { specs } from "./utils/swagger";

import productRouter from "./routes/productsRouter";
import userRouter from "./routes/userRouter";
import cartRouter from "./routes/cartRouter";
import { upload } from "./utils/multerConfig";

mongoose.set("strictQuery", false);

const dburl = process.env.DB_URL as string;
const port = process.env.PORT;

async function dbConnection() {
	await mongoose.connect(dburl);
	console.log("connected successfully!");
}
dbConnection().catch((err) => console.error(err));

const app: Express = express();

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

// app routes
// app.post("/uploads", upload.single("image"), (req, res) => {
// 	console.log(req.file?.filename);
// 	res.send("Hello World");
// })

app.use("/products", productRouter);
app.use("/user", userRouter);
app.use("/user/cart", cartRouter);

app.use(
	"/api/docs",
	swaggerUi.serve,
	swaggerUi.setup(specs, { explorer: true })
);

app.listen(port, () => {
	console.log(`Listening to port: ${port}`);
});
