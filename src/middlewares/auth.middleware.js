import { AsyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/User.model.js";

// this middleware will be used to protect routes that require authentication
// it will verify the access token sent in the request headers or cookies
// if token is valid, it will attach the user details to the request object and proceed to the next middleware or controller
// if token is invalid or expired, it will send 401 unauthorized error
export const verifyJwt = AsyncHandler(async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", ""); // access token from cookies or headers if sent from client
    
        if(!accessToken){
            return res.status(401).json({message: "Access token is missing"});
            // throw new ApiError(401, "Access token is missing"); // we can also throw error like this, but here we are sending response directly 
        }
        
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET); // verify the token using the secret key to decode the token
    
        // here we make db call to get user details from database using the id stored in the token
        // we can also store user details in the token itself, but it is not secure and also increases the size of the token
        // so it is better to store only the user id in the token and fetch other details from database
        // this way, if user details are updated in database, we will get the updated details in every request
        const user =  await User.findById(decodedToken._id)
        .select("-password -refreshToken") // exclude password and refresh token from the user details
    
        if(!user){
            throw new ApiError(401, "User not found");
        }
    
        req.user = user; // attach user details to the request object, so that we can access it in the next middleware or controller
        next(); // proceed to the next middleware or controller
    } catch (error) {
        throw new ApiError(401, "Invalid or expired access token"); // if token is invalid or expired, send 401 unauthorized error
    }
});
