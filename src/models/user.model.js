import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, /// cloudinary url
            required: true
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        passowrd: {
            type: String,
            required: [true, "Please provide a password"],
            minlength: 6,
        },
        refreshToken: {
            type: String,
        }   
    },
    { timestamps: true }
);

userSchema.preHook("Save", async function(next) {
    if(!this.isModified("password")) { // if password is not modified then no need to hash, just return to next middleware
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.isPasswordMatch = async function(enteredPassword) {  // this method will be used to compare the password entered by user with the hashed password in database
    return await bcrypt.compare(enteredPassword, this.password); // this.password refers to the hashed password in database
};

userModel.methods.generateAccessToken = function(){ // this method will be used to generate access token
    return jwt.sign(
        {
            _id: this.id,
            userName: this.userName,
            email: this.email,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" 
        } // access token will expire in 15 minutes
    );
}

userModel.methods.generateRefreshToken = function(){ // this method will be used to generate refresh token
    return jwt.sign(
        {
            _id: this.id // this only id will be stored in refresh token, no need to store other details, bcz refresh token is used to generate new access token
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" 
        } // access token will expire in 15 minutes
    );
}

export const User = mongoose.model("User", userSchema);