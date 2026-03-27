import { Router } from "express";
import multer from "multer";
import { GetStudent, handleLogin, handleStdProfile, RegisterStudent } from "./student.controller.js";

const studentRouter =Router()
const upload = multer({ dest: "uploads/" });
studentRouter.post("/student-register",RegisterStudent)
studentRouter.post("/student-login",handleLogin)
studentRouter.post("/std-profile-img",upload.single("image"),handleStdProfile)
studentRouter.post("/get-student",GetStudent)


export default studentRouter