import { Router } from "express";
import { registerAdmin, logInAdmin, creatingCourse } from "../controllers/admin.controllers.js"
import {upload} from "../middlewares/multer.middleware.js"


const adminRouter = Router()

adminRouter.route("/signup").post(registerAdmin)

adminRouter.route("/signin").post(logInAdmin)

adminRouter.route("/courses").post(
    upload.fields([
        {
            name: "imageLink",
            maxCount: 1
        }
    ]),
    creatingCourse
    )

export default adminRouter