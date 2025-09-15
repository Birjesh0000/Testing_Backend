import {Router} from "express";
import { loginUser, logOutUser, registerUser, refreshAccessToken } from "../controllers/User.controller.js";
import {uplaod} from "../middlewares/multer.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router(); // Create a new router instance

// handover all the requests on this route to the controller (registerUser function)
// use of middleware (upload) => multer, to handle file uploads, before reaching the controller
router.route("/register").post(
    uplaod.fields(
        {name: "avatar", maxCount: 1},
        {name: coverImage, maxCount: 1}
    ), 
    registerUser
);

router.route("/login").post(loginUser);  // login user controller, to authenticate user and generate tokens
router.route("/refresh-token").post(refreshAccessToken); // refresh token controller, to generate new access token using refresh token

// secure route:-
//  only accessible to authenticated users
//  use verifyJwt middleware to verify the access token before reaching the controller
//  if token is valid, proceed to the controller, otherwise send 401 unauthorized error
//  here we can use multiple middlewares, like verifyJwt, anotherMiddleware, etc.
//  the order of middlewares is important, they will be executed in the order they are defined
//  finally, the controller function will be executed if all middlewares pass successfully


router.route("/profile").get(jwtAuth, getUserProfile); // getUserProfile is another controller function to get user profile details
router.route("logout").post(verifyJwt, logOutUser); // logout user controller, to clear the cookies and remove refresh token from database



export default router;