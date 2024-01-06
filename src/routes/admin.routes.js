import { Router } from "express";
import { registerAdmin, logInAdmin, creatingCourse, viewingCourses } from "../controllers/admin.controllers.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/adminAuth.middleware.js";


const adminRouter = Router()

adminRouter.route("/signup").post(registerAdmin)

adminRouter.route("/signin").post(logInAdmin)

adminRouter.route("/courses").post
(
    verifyJwt,
    upload.fields([
        {
            name: "imageLink",
            maxCount: 1
        }
    ]),
    creatingCourse
)

adminRouter.route("/courses").get(verifyJwt, viewingCourses)

export default adminRouter