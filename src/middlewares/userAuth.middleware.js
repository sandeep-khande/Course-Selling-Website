import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";


export const verifyUserJwt = asyncHandler( async(req, _, next) => {
try {
        //Taking access of token
        const token = req.cookies?.accessToken || req.headers["Authorization"]?.replace("Bearer ", "")
        
        if(!token){
            throw new ApiError(401, "Unathorized request")
        }
        
        //checking if the recieved token is correct
        const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
        
        req.user = user;
        next()
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid Token")
}
})