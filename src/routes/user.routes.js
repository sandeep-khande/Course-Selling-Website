import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";

const router = Router()

router.route("/signup").post(registerUser)



// router.route("/signin").post(loginUser)

// router.route("/courses").get(allCourses)

// router.route("/course/:courseId").post(purchasingCourse)

// router.route("purchasedCourses").get(myCourses)

export default router