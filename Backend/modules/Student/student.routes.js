import { Router } from "express";
import multer from "multer";
import { EditProfileDetails, enrollCourse, Getuser, handleLogin, handleStdProfile, Registeruser, resetPassword, sendOTPEmail, verifyOTP } from "./student.controller.js";

const studentRouter =Router()
const upload = multer({ dest: "uploads/" });

studentRouter.post("/register",Registeruser)
studentRouter.post("/login",handleLogin)
studentRouter.post("/std-profile-img",upload.single("image"),handleStdProfile)
studentRouter.post("/get-student",Getuser)
studentRouter.post("/edit-profile-details",EditProfileDetails)

studentRouter.post("/send-otp",sendOTPEmail)
studentRouter.post("/verify-otp",verifyOTP)

studentRouter.post("/reset-password",resetPassword)

studentRouter.post("/enroll-course",enrollCourse)


export default studentRouter