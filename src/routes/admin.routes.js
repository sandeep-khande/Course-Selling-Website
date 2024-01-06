import { Router } from "express";
import { registerAdmin, logInAdmin, creatingCourse, viewingCourses } from "../controllers/admin.controllers.js"
import {upload} from "../middlewares/multer.middleware.js"


const adminRouter = Router()

adminRouter.route("/signup").post(registerAdmin)

adminRouter.route("/signin").post(logInAdmin)

adminRouter.route("/courses").post
(
    upload.fields([
        {
            name: "imageLink",
            maxCount: 1
        }
    ]),
    creatingCourse
)

adminRouter.route("/courses").get(viewingCourses)

export default adminRouter