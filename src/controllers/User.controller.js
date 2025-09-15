import {AsyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/User.model.js";
import {uploadToCloudinary} from "../utils/Cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


// function to generate access token and refresh token
// this function will be used in login and register user and many other places
const generateAccessAndRefreshToken = async(userId) => {
    try{
        const user = await User.findById(userId);
        if(!user){
            throw new ApiError(404, "User not found");
        }

        const refreshToken = user.generateRefreshToken(); // method from user model to generate refresh token
        const accessToken = user.generateAccessToken(); // method from user model to generate access token
        
        // store refresh token in database
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false}); // disable validation before save, bcz we are only updating refresh token field

        return {accessToken, refreshToken}; // return both tokens as object to the caller
    }
    catch{
        throw new ApiError(500, "Failed to generate access and refresh token");
    }
}

/// register user controller
const registerUser = AsyncHandler(async (req, res) => {
    // Extract user details from request body
    //perform validation
    //check if user already exists
    // check for necessary fields, like name, email, password, avatar
    // upload images on cloudinary
    // create user object -> create entry of new user in the database
    /// remove sensitive info like password and refresh token field from response
    /// check for user creation success
    // send response to client

    /// if data from frontend as form data or json data, then it will be in req.body
    /// otherwise if data is sent via url, then it will be in req.query
    const {fullName, email, userName, avatar, password} = req.body;

    // now checks for necessary fields using multiple if conditions
    // if(fullName === ""){
    //     throw new ApiError(400, "Full name is required");
    // }

    // or use single if condition, which is more efficient
    if(
        [fullName, email, userName, avatar, password].some((field) => !field || field.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    // upper check is for empty string, null, undefined, or string with only spaces
    // further validations can be added, like email format, password strength, etc.

    // now check if user already exists with the same email and username
    const existingUser = await User.findOne({$or: [{ email }, { userName }]});
    if(existingUser){
        throw new ApiError(409, "User already exists with this email or username");
    }

    // if avatar is a file, then it will be in req.files (handled by multer middleware)
    // if avatar is a url or base64 string, then it will be in req.body
    // but we assume avatar is a file ( as already handles by multer middleware in router files)

    const avatarLocalPath = req.files?.avatar[0]?.path; // get the path of uploaded avatar image
    const coverImageLocalPath = req.files?.coverImage[0]?.path; // get the path of uploaded cover image

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar Image are required");
    }
    
    // upload avatar to cloudinary
    const avatarImage = await uploadToCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadToCloudinary(coverImageLocalPath) : null;

    if(!avatarUploadResponse){
        throw new ApiError(500, "Failed to upload avatar to cloudinary");
    }

    // create user object, for database entry
    const User = await User.create({
        fullName,
        avatar: avatarImage.url,
        converImage: coverImage ? coverImage.url : undefined,
        email,
        userName: userName.toLowerCase(), // to make username case-insensitive
        password // will be hashed in pre-save hook of User model
    })

    // check if user creation was successful
    const createdUser = await User.findById(User._id).select("-password -refreshToken -__v -createdAt -updatedAt");
    if(!createdUser){
        throw new ApiError(500, "User registration failed, please try again");
    }

    // 
    return res.status(201).json(
        new ApiResponse(200, "User registered successfully", createdUser)
    );

});


// login user controller
const loginUser = AsyncHandler(async (req, res) => {
    // extract email and password from req.body
    // perform validation
    // check if user exists (username or email based account) in the database
    // check if password is correct
    // generate access token and refresh token
    // send cookies in httpOnly mode
    // send response to client

    const {email, userName, password} = req.body; // assuming login can be done using either email or username
    
    if(!userName && !email){ /// at least one of them should be present for login
        throw new ApiError(400, "Username or email is required to login");
    }

    const user = await User.findOne({  /// find user by email or username in database
        $or: [{email}, {userName}]
    });

    if(!user){
        throw new ApiError(404, "User not found with this email or username");
    }

    // user is the instance of User model, so we can use the methods defined in the model
    // like isPasswordMatch, generateAccessToken, generateRefreshToken
    const isPasswordValid = await user.isPasswordMatch(password); // method from user model to compare password

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid password");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id) // function to generate both tokens and store refresh token in database

    // here we take user details except password and refresh token to send in response
    const userResponse = await User.findById(user._id). // find user by id, this is db call
    select("-password -refreshToken -__v -createdAt -updatedAt");

    // send httpOnly cookie to client
    const options = {
        httpOnly: true,
        secure : true // set to true if using https
    }

    // send response to client with cookies
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "User logged in successfully", {user: userResponse, accessToken, refreshToken}));// in this step, user send token from their side
    
});


// logout user controller can be added here
const logOutUser = AsyncHandler(async (req, res) => {
    /// user is not accessible here directly, so we need to get user details from auth middleware
    // we have attached user details to req.user in auth middleware, here we can use it to get user id
    // bcz we need to remove refresh token from database for that user


    // Steps : -
    // get user id from req.user (set by auth middleware)
    // remove refresh token from database
    // clear cookies from client side
    // send response to client

    await User.findByIdAndUpdate( /// remove refresh token from database for that user
        req.user._id,
        {
            $set : {refreshToken: undefined} // remove refresh token from database
        },
        {
            new: true // return the updated document
        }
    )

    const options = {
        httpOnly: true,
        secure : true, // set to true if using https
        expires: new Date(0) // set cookie expiry to past date to clear it from client side
    }

    // send response to client with cookies cleared
    return res.status(200)
    .clearCookie("accessToken", options) // clear access token cookie from client side
    .clearCookie("refreshToken", options) // clear refresh token cookie from client side
    .json(new ApiResponse(200, {}, "User logged out successfully")); // send response to client

}); 

// create end point for refreshing access token using refresh token
// this end point will be public, so no auth middleware is required
// user will send refresh token in httpOnly cookie
// we will verify the refresh token and generate new access token and refresh token
// we will store the new refresh token in database and send both tokens to client in httpOnly cookies
const refreshAccessToken = AsyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken; // get refresh token from cookies or request body

    if(!incomingRefreshToken){
        throw new ApiError(401, "unothorized user"); // if no refresh token is sent, then user is not authorized
    }

    try {
        const decodedToken = jwt.verify( // verify the incoming refresh token wether it is valid or not
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken._id) // find user by id stored in the token
    
        if(!user){ // if user not found in database, then user is not authorized
            throw new ApiError(401, "User not found");
        }
    
        // check if the incoming refresh token matches the one stored in database
        if(user.refreshToken !== incomingRefreshToken){
            throw new ApiError(401, "Invalid refresh token, please login again");
        }
    
        const options = {
            httpOnly: true,
            secure : true // set to true if using https
        }
    
        const {newAccessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id) // generate new access token and refresh token
    
        return res.status(200)
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, {newAccessToken, refreshToken: newRefreshToken}, "Access token refreshed successfully"));
    
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token"); // if token is invalid or expired, send 401 unauthorized error
    }
});


/// change user password controller can be added here
const changeUserPassword = AsyncHandler(async (req, res) => {
    // get user id from req.user (set by auth middleware)
    // extract old password and new password from req.body
    // hash new password
    // update password in database
    // send response to client

    const {oldPassword, newPassword} = req.body; // extract old password and new password from req.body

    if(!oldPassword || !newPassword){
        throw new ApiError(400, "Old password and new password are required");
    }

    const user = await User.findById(req.user._id); // find user by id from req.user
    if(!user){
        throw new ApiError(404, "User not found");
    }

    // check if old password is correct, by the method from user model to compare password
    const isPasswordValid = await user.isPasswordMatch(oldPassword); // method from user model to compare password
    if(!isPasswordValid){
        throw new ApiError(401, "Old password is incorrect");
    }

    // check methods from user model to hash password
    user.password = newPassword; // set new password, it will be hashed in pre-save hook of User model
    await user.save({validateBeforeSave: false}); // save the user with new password

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully")); // send response to client
});

/// get user profile controller can be added here, this is used to get user profile details
const getUserProfile = AsyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User profile fetched successfully")); // req.user is set by auth middleware
});

// similarly, update user profile controller can be added here
const updateUserProfile = AsyncHandler(async (req, res) => {
    // get user id from req.user (set by auth middleware)
    // extract user details from req.body
    // update user details in database
    // send response to client
    const {fullName, email} = req.body; // extract user details from req.body

    if(!fullName || !email){
        throw new ApiError(400, "Full name and email are required");
    }

    // this step gives updated user details after updating in database
    const updatedUser = await User.findByIdAndUpdate( // update user details in database
        req.user._id,
        {
            $set: {fullName, email}
        },
        {
            new: true // return the updated document
        }
    ).select("-password -refreshToken -__v -createdAt -updatedAt"); // exclude sensitive fields from response

    return res.status(200).json(new ApiResponse(200, updatedUser, "User profile updated successfully"));

});

// updare user avatar controller can be added here
const updateUserAvatar = AsyncHandler(async (req, res) => {
    // get user id from req.user (set by auth middleware)
    // extract avatar image from req.files (handled by multer middleware)
    // upload avatar to cloudinary
    // update avatar url in database
    // send response to client

    const avatarLocalPath = req.file?.path; // get the path of uploaded avatar image, uploaded by multer middleware

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required to update");
    }

    // this give url of uploaded avatar image on cloudinary
    const avatarImage = await uploadToCloudinary(avatarLocalPath); // upload avatar to cloudinary
    if(!avatarImage){
        throw new ApiError(500, "Failed to upload avatar to cloudinary");
    }

    // thi step gives updated user details after updating in database
    const user = await User.findByIdAndUpdate( // update avatar url in database
        req.user._id,
        {
            $set: {avatar: avatarImage.url}
        },
        {
            new: true // return the updated document
        }
    ).select("-password -refreshToken -__v -createdAt -updatedAt"); // exclude sensitive fields from response

    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
})

// similarly, update cover image controller can be added here



// export all controller functions, so that they can be used in routes files
export {registerUser, loginUser, logOutUser, refreshAccessToken, changeUserPassword, getUserProfile, updateUserProfile, updateUserAvatar};