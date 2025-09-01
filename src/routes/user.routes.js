import {Router} from "express";
import { registerUser } from "../controllers/User.controller.js";

const router = Router(); // Create a new router instance

router.route("/register").post(registerUser); // Define a POST route for user registration
//router.route("/login").post(loginUser);       // Define a POST route for user login


export default router;