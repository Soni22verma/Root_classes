import { Router } from "express";
import { AdminLogin, getAllStudent } from "./admin.controller.js";
import errorHandler from "../../middleware/error.js";

const adminRouter = Router()
adminRouter.post("/admin-login",AdminLogin)
adminRouter.post("/getall_student",getAllStudent)
adminRouter.use(errorHandler)

export default adminRouter