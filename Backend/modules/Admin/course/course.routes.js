import { Router } from "express";
import multer from "multer";
import { CreateCourse, GetAllCourse, handleCourseEdit, handleDeleteCourse } from "./course.controller.js";


const courseRouter = Router()
const upload = multer({ dest: "uploads/" });
courseRouter.post("/create_course",upload.single("image"),CreateCourse)
courseRouter.post("/get_courses",GetAllCourse)
courseRouter.post("/edit_course",upload.single("image"),handleCourseEdit)
courseRouter.post("/delete_course",handleDeleteCourse)

export default courseRouter