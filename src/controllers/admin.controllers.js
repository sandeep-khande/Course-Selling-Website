import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Admin } from "../models/admin.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { Course } from "../models/course.models.js";



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

    const options = {
        httpOnly: true,
        secure: true
    }

    res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshTokens", refreshToken, options)
    .json(
        new ApiResponse
        (
            200,
            {
                accessToken, refreshToken
            },
            "Admin logged in successfully"
        )
    )
    
})

const creatingCourse = asyncHandler( async(req, res) => {
    const { title, description, price } = req.body;

    if (
        [title, description, price].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    //Checking for the image
    const imageLinkLocalPath = req.files?.imageLink[0]?.path;

    if(!imageLinkLocalPath){
        throw new ApiError(400, "image file is required")
    }

    //Uploading them to cloudinary
    const imageLink = await uploadOnCloudinary(imageLinkLocalPath)

    if(!imageLink){
        throw new ApiError(400, "Image file is required")
    }

    const course = await Course.create({
        title,
        description,
        price,
        imageLink: imageLink.url
    })

    res.status(200).json(
        new ApiResponse(200, course._id, "course created successfully")
    )


})

const viewingCourses = asyncHandler( async(req, res) => {
    const allCourses = await Course.find({})

    res.status(200).json(
        new ApiResponse(200, allCourses)
    )
})

export { registerAdmin, logInAdmin, creatingCourse, viewingCourses }