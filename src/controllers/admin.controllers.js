import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Admin } from "../models/admin.models.js"

const registerAdmin = asyncHandler( async(req, res) => {

    //getting details from frontend
    const { username, password } = req.body;
    console.log("username", username);

    //checking if the field is empty
    if (
        [username, password].some( (field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "Username & Password both are required")
    }

    //To check if the admin already exists
    const existingAdmin = await Admin.findOne({username})

    if(existingAdmin){
        throw new ApiError(409, "Admin with the username already exists")
    }

    //entry in database
    const admin = await Admin.create({
        username: username.toLowerCase(),
        password
    })

    //Removing password and refreshToken from response
    const createdAdmin = await Admin.findById(admin._id).select(
        "-password, -refreshToken"
    )

    //checking for the admin creation
    if (!createdAdmin) {
        throw new ApiError(500, "Something went wrong while registering admin")
    }

    //sending the response
    return res.status(200).json(
        new ApiResponse(200, "Admin created successfully")
    )
})

export { registerAdmin }