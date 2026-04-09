import { Router } from "express";
import multer from "multer";
import { EditProfileDetails, Getuser, handleLogin, handleStdProfile, Registeruser } from "./student.controller.js";

const studentRouter =Router()
const upload = multer({ dest: "uploads/" });
studentRouter.post("/student-register",Registeruser)
studentRouter.post("/student-login",handleLogin)
studentRouter.post("/std-profile-img",upload.single("image"),handleStdProfile)
studentRouter.post("/get-student",Getuser)
studentRouter.post("/edit-profile-details",EditProfileDetails)


export default studentRouter