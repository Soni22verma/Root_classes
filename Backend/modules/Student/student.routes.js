import { Router } from "express";
import multer from "multer";
import { EditProfileDetails, getScholarshipTestforStudent, Getuser, handleLogin, handleStdProfile, Registeruser, resetPassword, sendOTPEmail, verifyOTP } from "./student.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const studentRouter =Router()
const upload = multer({ dest: "uploads/" });

studentRouter.post("/register",Registeruser)
studentRouter.post("/login",handleLogin)
studentRouter.post("/std-profile-img",upload.single("image"),handleStdProfile)
studentRouter.post("/edit-profile-details",EditProfileDetails)
studentRouter.post("/get-student",Getuser)

studentRouter.post("/send-otp",sendOTPEmail)
studentRouter.post("/verify-otp",verifyOTP)

studentRouter.post("/reset-password",resetPassword)
studentRouter.post("/get-testfor-student",authMiddleware,getScholarshipTestforStudent)



export default studentRouter