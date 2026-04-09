import express, { Router } from "express"
import {  createCourse, GetCategory, GetCreatedCourse } from "./createCourse.controller.js"

const createcourseRouter = Router()
createcourseRouter.post("/create_course",createCourse)
createcourseRouter.post("/get_category",GetCategory)
createcourseRouter.post("/get_course",GetCreatedCourse)


export default createcourseRouter 