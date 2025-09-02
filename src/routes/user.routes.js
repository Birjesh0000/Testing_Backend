import {Router} from "express";
import { registerUser } from "../controllers/User.controller.js";
import {uplaod} from "../middlewares/multer.js";

const router = Router(); // Create a new router instance

// handover all the requests on this route to the controller (registerUser function)
// use of middleware (upload) to handle file uploads, before reaching the controller
router.route("/register").post(
    uplaod.fields(
        {name: "avatar", maxCount: 1},
        {name: coverImage, maxCount: 1}
    ), 
    registerUser
);


export default router;