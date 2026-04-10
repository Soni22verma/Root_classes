import express, { Router } from "express"
import {  createCourse, DeleteCourse, GetCategory, GetCreatedCourse, UpdateCourse } from "./createCourse.controller.js"

const createcourseRouter = Router()
createcourseRouter.post("/create_course",createCourse)
createcourseRouter.post("/get_category",GetCategory)
createcourseRouter.post("/get_course",GetCreatedCourse)
createcourseRouter.post("/edit_course",UpdateCourse)
createcourseRouter.post("/delete_course",DeleteCourse)


export default createcourseRouter 