import { Router } from "express";
import { enrollCourse, GetEnrollments } from "./enrollment.controller.js";

const enrollRouter = Router()
enrollRouter.post("/enroll_course",enrollCourse)
enrollRouter.post("/get_enrollment",GetEnrollments)


export default enrollRouter