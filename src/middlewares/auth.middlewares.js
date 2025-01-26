import jwt from "jsonwebtoken";
import {asyncHandler} from "../utils/asycHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";


const auth = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token) throw new ApiError(401,"unable to get AcessToken");
    
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        if(!decode || !decode?._id) throw new ApiError(401,"AcessToken is gets corrupted");
    
        const user = await User.findById(decode?._id).select(
            "-password -refreshToken"
        );
    
        if(!user) throw new ApiError(401,"AcessToken is get corrupted");
    
        req.user = user;
    
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})

export {auth};