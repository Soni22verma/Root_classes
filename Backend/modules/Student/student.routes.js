import { Router } from "express";
import multer from "multer";
import { EditProfileDetails, forgotPassword, Getuser, handleLogin, handleStdProfile, Registeruser, sendOTPEmail, verifyOTP } from "./student.controller.js";

const studentRouter =Router()
const upload = multer({ dest: "uploads/" });

studentRouter.post("/student-register",Registeruser)
studentRouter.post("/student-login",handleLogin)
studentRouter.post("/std-profile-img",upload.single("image"),handleStdProfile)
studentRouter.post("/get-student",Getuser)
studentRouter.post("/edit-profile-details",EditProfileDetails)

studentRouter.post("/send-otp",sendOTPEmail)
studentRouter.post("/verify-otp",verifyOTP)

studentRouter.post("/forget-password",forgotPassword)
studentRouter.post("/reset-password",forgotPassword)


export default studentRouter