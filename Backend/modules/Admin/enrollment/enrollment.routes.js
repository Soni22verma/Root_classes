import { Router } from "express";
import { enrollCourse, GetAllEnrollments, GetEnrollments } from "./enrollment.controller.js";

const enrollRouter = Router()
enrollRouter.post("/enroll_course",enrollCourse)
enrollRouter.post("/get_enrollment",GetEnrollments)
enrollRouter.get("/all_enrollment",GetAllEnrollments)


export default enrollRouter