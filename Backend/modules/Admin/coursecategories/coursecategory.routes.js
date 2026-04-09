import express, { Router } from 'express'
import { createFullCourse } from './coursecategory.controller.js'
import multer from 'multer';

const courseCategotyRouter = Router()
const upload = multer({ dest: "uploads/" });
courseCategotyRouter.post("/create_full_course", upload.fields([
    { name: "video", maxCount: 1 },
    { name: "notes", maxCount: 1 }
  ]),createFullCourse)

  export default courseCategotyRouter