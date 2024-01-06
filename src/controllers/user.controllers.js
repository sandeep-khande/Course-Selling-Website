
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
    try {
        const course = await Course.findOne({_id: req.params.courseId});
        console.log(req.params.courseId);
        const UpdatedUser = await User.findOneAndUpdate({
            username: req.user,
        },{
            $push: {purchasedCourses: course}
        });

        res.json({message: 'Course Purchased Succesfully'});
    } catch (error) {
        res.json({"error": error.message});
    }
})

const myCourses = asyncHandler( async(req, res) => {
    try {
        const user = await User.findOne({username: req.user});
        await user.populate('purchasedCourses');
        res.json({purchasedCourses: user.purchasedCourses});
    } catch (error) {
        res.json({"error": error.message});
    }
})

export { registerUser, loginUser, allCourses, purchasingCourse, myCourses }