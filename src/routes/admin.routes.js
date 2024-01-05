import { Router } from "express";
import { registerAdmin } from "../controllers/admin.controllers.js"


const adminRouter = Router()

adminRouter.route("/signup").post(registerAdmin)

export default adminRouter