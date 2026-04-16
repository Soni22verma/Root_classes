import express, { Router } from 'express'
import { getAllEnrollments } from './enrollment.controller.js'

const enrollmentRouter = Router()
enrollmentRouter.get("/get-enrollment",getAllEnrollments)

export default enrollmentRouter