import { Router } from "express";
import { verifyUserJwt } from "../middlewares/userAuth.middleware.js";
import { registerUser, loginUser, allCourses, purchasingCourse, myCourses } from "../controllers/user.controllers.js";


const router = Router()

router.route("/signup").post(registerUser)

router.route("/signin").post(loginUser)

router.route("/courses").get(verifyUserJwt, allCourses)

router.route("/courses/:courseId").post(verifyUserJwt, purchasingCourse)

router.route("/purchasedCourses").get(myCourses)

export default router