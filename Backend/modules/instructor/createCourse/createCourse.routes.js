import express, { Router } from "express"
import {  createCourse, DeleteTopic, GetCategory, GetCreatedCourse, handleAddChapter, handleAddModule, handleAddTopic, handleDeleteChapter, handleDeleteModule, handleEditTopic, handleGetCourseById, handleUpdateChapter, handleUpdateModule } from "./createCourse.controller.js"
import multer from "multer";

const createcourseRouter = Router()
const Upload = multer({ dest: "uploads/" });
createcourseRouter.post("/create_course",createCourse)
createcourseRouter.post("/get_category",GetCategory)
createcourseRouter.post("/get_course",GetCreatedCourse)
createcourseRouter.post("/get-course-by-id" , handleGetCourseById)

createcourseRouter.post("/add-module" , handleAddModule)
createcourseRouter.post("/edit-module",handleUpdateModule)
createcourseRouter.post("/delete-module",handleDeleteModule)

createcourseRouter.post("/add-chapter",handleAddChapter)
createcourseRouter.post("/edit-chapter",handleUpdateChapter)
createcourseRouter.post("/delete-chapter",handleDeleteChapter)

createcourseRouter.post("/add-topic",Upload.fields([
    { name: "video", maxCount: 1 },
    { name: "notes", maxCount: 1 }
  ]),handleAddTopic)
  createcourseRouter.post("/edit-topic",Upload.fields([
    { name: "video", maxCount: 1 },
    { name: "notes", maxCount: 1 }
  ]),handleEditTopic)
createcourseRouter.post("/delete-topic",DeleteTopic)

export default createcourseRouter 