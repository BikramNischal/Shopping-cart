import "dotenv/config";
import express, {Express, Request, Response} from "express";
import mongoose from "mongoose";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";

import { router } from "./routes/routes";

import swaggerUi from "swagger-ui-express";
import swaggerOutput from "./utils/swagger_output.json";



mongoose.set("strictQuery", false);

const dburl = process.env.DB_URL as string;
const port = process.env.PORT ;

async function dbConnection() { 
    await mongoose.connect(dburl);
    console.log("connected successfully!");
}
dbConnection().catch( err => console.error(err));


const app: Express =  express();

// Middlewares 
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());



app.use("/", router);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput));

app.listen(port , () => {
    console.log(`Listening to port: ${port}`);
})