import express, { urlencoded } from "express";
import cors from "cors";
import cookieParese from "cookie-parser";

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}));

app.use(express.json({limit : '5mb'})); // to parse json data, comming from client
app.use(express,urlencoded({extended : true})); // to parse urlencoded data, like form data
app.use(express.static('public')); // to serve static files like images, css files
app.use(cookieParese()); // to parse cookies

const app = express();
