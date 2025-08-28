import dotenv from "dotenv";
import { connectDB } from "./db/index.js";

dotenv.config({path: './env'}); // to use env file

connectDB() // calling the function to connect to database, it is a async function, returns a promise
.then(() => {
    console.log("Server is running");
    app.listen(process.env.PORT || 5000);// now server will listen all the requests on this port
})
.catch((error) => console.log(error));