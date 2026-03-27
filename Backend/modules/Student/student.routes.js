import { Router } from "express";
import { handleLogin, RegisterStudent } from "./student.controller.js";

const studentRouter =Router()
studentRouter.post("/student-register",RegisterStudent)
studentRouter.post("/student-login",handleLogin)


export default studentRouter