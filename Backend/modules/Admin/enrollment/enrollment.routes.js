import express, { Router } from 'express'
import {getAllPurchasedCourses} from "../enrollment/enrollment.controller.js"
const enrollmentRouter = Router()
enrollmentRouter.get("/api/get-purches-course",getAllPurchasedCourses)

export default enrollmentRouter