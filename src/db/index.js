// here we write logic to connect to database
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB = async () => {  /// use of async await bcz db is in another continent
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`); // connecting to database
        console.log("Database connected");
    } catch (error) {
        console.log("thers is connection error", error);
        process.exit(1);// exit the process if there is error
    }
}