import { Router } from "express";
import { registerUser, loginUser, allCourses } from "../controllers/user.controllers.js";
import { verifyUserJwt } from "../middlewares/userAuth.middleware.js";


const router = Router()

router.route("/signup").post(registerUser)

router.route("/signin").post(loginUser)

router.route("/courses").get(verifyUserJwt, allCourses)

// router.route("/course/:courseId").post(purchasingCourse)

// router.route("purchasedCourses").get(myCourses)

export default router