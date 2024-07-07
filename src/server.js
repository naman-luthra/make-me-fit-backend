import { Routes } from "./routes";
import { connectToDB } from "./db";

import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";

dotenv.config();

const app=express();
app.use(express.json({limit: '50mb'}));
const PORT = process.env.PORT || 8080;

app.use(cors({
    origin: '*'
}));

Routes.forEach(Route=>app[Route.method](Route.path, Route.handler));

connectToDB().then(()=>{
    app.listen(PORT,()=>console.log("Server Up!"))
});