import { Router } from "express";
import multer from "multer";
import { EditProfileDetails, GetStudent, handleLogin, handleStdProfile, RegisterStudent } from "./student.controller.js";

const studentRouter =Router()
const upload = multer({ dest: "uploads/" });
studentRouter.post("/student-register",RegisterStudent)
studentRouter.post("/student-login",handleLogin)
studentRouter.post("/std-profile-img",upload.single("image"),handleStdProfile)
studentRouter.post("/get-student",GetStudent)
studentRouter.post("/edit-profile-details",EditProfileDetails)


export default studentRouter