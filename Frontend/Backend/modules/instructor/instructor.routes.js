import express, { Router } from 'express'
import { InstructorLogin } from './instructor.controller.js'

const instructorRouter = Router()
instructorRouter.post("/instructor_login",InstructorLogin)

export default instructorRouter