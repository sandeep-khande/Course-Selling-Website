import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Admin } from "../models/admin.models.js"


const accessTokenAndRefreshToken = async(userId) => {
    const admin = await Admin.findById(userId);
    const accessToken = admin.generateAccessToken()
    const refreshToken = admin.generateRefreshToken()

    admin.refreshToken = refreshToken

    await admin.save({ validateBeforeSave: false })

    return { accessToken, refreshToken}
}

const registerAdmin = asyncHandler( async(req, res) => {

    //getting details from frontend
    const { username, password } = req.body;
    // console.log("username", username);

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

const logInAdmin = asyncHandler( async(req, res) => {
    const { username, password } = req.body;
    
    const existingAdmin = await Admin.findOne({username})

    if(!existingAdmin || !(await existingAdmin.isPasswordCorrect(password))){
        throw new ApiError(409, "Admin doesn't exist")
    }

    const {accessToken, refreshToken} = await accessTokenAndRefreshToken(existingAdmin._id)
    console.log(accessToken, refreshToken);

    res.status(201).json(
        new ApiResponse
        (
            200,
            {
                existingAdmin: accessToken, refreshToken
            },
            "Admin logged in successfully"
        )
    )
    
})

export { registerAdmin, logInAdmin }