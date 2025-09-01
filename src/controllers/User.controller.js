import {AsyncHandler} from "../utils/asyncHandler.js";

const registerUser = AsyncHandler(async (req, res) => {
    res.status(201).json({
         message: "User registered successfully" 
    });
});

export {registerUser};