import {AsyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/User.model.js";
import {uploadToCloudinary} from "../utils/Cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";


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

export {registerUser};