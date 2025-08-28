import dotenv from "dotenv";
import { connectDB } from "./db/index.js";

dotenv.config({path: './env'}); // to use env file

connectDB(); // calling the function to connect to database