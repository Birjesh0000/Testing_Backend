import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express(); // Initialize express app

// CORS Middleware
// This allows frontend (React) and backend (Node/Express) to talk to each other
app.use(cors({
    origin: process.env.CORS_ORIGIN, // only allow requests from this origin (of frontend)
    credentials: true                // allow cookies, sessions, and auth headers across frontend & backend
}));    

// Middlewares to parse incoming requests and cookies 
app.use(express.json({limit : '5mb'})); // to parse json data, comming from client (e.g., API requests with JSON body)
app.use(express.urlencoded({extended : true})); // to parse urlencoded data, (e.g., form submissions)
app.use(express.static('public')); // to serve static files (e.g., images, CSS, uploads) from "public" folder
app.use(cookieParser()); // to parse cookies sent by the client



// import routes
import userRoutes from "./routes/user.routes.js";

// Use routes
app.use("/api/v1/user", userRoutes); // All user-related routes will be prefixed with /api/v1/user


export {app}; // Export app for use in index.js