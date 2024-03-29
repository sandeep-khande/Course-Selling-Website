
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/course.models.js";
import mongoose from "mongoose";


const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //Storing refresh tokens in database
        user.refreshToken = refreshToken
        //while saving it validates the password again hence false
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    
    //getting details from frontend
    const { username, password } = req.body
    // console.log("username: ", username);

    //Validating username
    if (
        [username, password].some( (field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "Username & Password both are required")
    }

    //Checking if the User already exist
    const existedUser = await User.findOne({username})

    if(existedUser){
        throw new ApiError("409", "Username already exists")
    }

    //Entry in database
    const user = await User.create({
        username: username.toLowerCase(),
        password
    })

    //Removing password and refreshToken from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //checking for the user creation
    if(!createdUser){
        throw new ApiError("500", "Something went wrong while registering the user")
    }

    //Returning response
    return res.status(201).json(
        new ApiResponse(200, "User created successfully")
    )

})

const loginUser = asyncHandler( async(req, res) => {
    const {username, password} = req.body

    const user = await User.findOne({username})

    if(!user || !(await user.isPasswordCorrect(password))){
        throw new ApiError(409, "User doesn't exist")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    // console.log(accessToken, refreshToken);

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                accessToken, refreshToken
            },
            "User logged in successfully"
        )
    ) 

})


const allCourses = asyncHandler( async(req, res) => {
    const courses = await Course.find({})

    res.status(200).json(
        new ApiResponse(200, courses)
    )
})

const purchasingCourse = asyncHandler( async(req, res) => {
    const courseId = req.query.courseId
    // console.log(courseId);

    const requiredCourse = await Course.findOne({ _id: courseId }).select(" -password -refreshToken ")
    // console.log(requiredCourse);

    if(!requiredCourse){
        throw new ApiError(404, "course not found")
    }

    // console.log(req.user.username);
    const purchasedCourse = await User.findOneAndUpdate(
        {
            username: req.user.username
        },
        {
            $push: {"purchasedCourse": [requiredCourse]}
        },
        {
            returnNewDocument: true
        }
    )

    res.status(200).json(
        new ApiResponse(
            200,
            {
                purchasedCourse
            },
            "course purchased successfully"
        )
    )
})

const myCourses = asyncHandler( async(req, res) => {
    const username = req.user.username
    const user = await User.findOne({ username })
    // console.log(user);

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const purchasedCourse = await user.populate("purchasedCourse") 

    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: purchasedCourse
            }
            )
    )

})

export { registerUser, loginUser, allCourses, purchasingCourse, myCourses }