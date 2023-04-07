import { Routes } from "./routes";
import { connectToDB } from "./db";

const express = require('express');
const bodyParser = require('body-parser');
const app=express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 8080;

const cors = require('cors');

app.use(cors({
    origin: '*'
}));

Routes.forEach(Route=>app[Route.method](Route.path, Route.handler));

connectToDB().then(()=>{
    app.listen(PORT,()=>console.log("Server Up!"))
});