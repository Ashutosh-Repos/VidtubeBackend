import { DB_NAME } from "../constants.js";
import mongoose from "mongoose";

const dbConnect = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONOGO_DB_URI}/${DB_NAME}`);
        console.log(`mongodb connected ! DB host = ${connectionInstance.connection.host}`);
    }catch(error){
        console.log("db connection unsucessful\n", error);
        process.exit(1);
    }
}

export {dbConnect}