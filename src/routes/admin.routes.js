import { Router } from "express";
import { registerAdmin, logInAdmin } from "../controllers/admin.controllers.js"


const adminRouter = Router()

adminRouter.route("/signup").post(registerAdmin)

adminRouter.route("/signin").post(logInAdmin)

export default adminRouter