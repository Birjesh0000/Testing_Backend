import express, { urlencoded } from "express";
//express here is a function imported from the Express module. 
//This function acts as a class or a blueprint for creating an Express application.
import cors from "cors"; // import CORS middleware from the cors module.
import cookieParser from "cookie-parser";

const app = express(); // creating instance of express class
//This app instance is a specific object that has its own state and can be configured 
//independently of any other Express instance

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
app.use(cookieParser()); // to parse cookies sent by the client to JavaScript object.
//When a client's browser sends a request, it often includes a Cookie header that contains key-value pairs of data.


////  app.use(express.json({limit : '5mb'}));
/// It reads the JSON string from the request body and converts it into a standard JavaScript object, 
// which is then attached to the req.body property.

// import routes
import userRoutes from "./routes/user.routes.js";

// Use routes
app.use("/api/v1/user", userRoutes); // All user-related routes will be prefixed with /api/v1/user


export {app}; // Export app for use in index.js