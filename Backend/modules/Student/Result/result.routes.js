import express, { Router } from 'express'
import { checkTestAttempt, getStudentResults, submitTest } from './result.controller.js'

const resultRouter = Router()

resultRouter.post('/submit_test',submitTest)
resultRouter.post("/check-existing-test",checkTestAttempt)
resultRouter.post("/get-student-results", getStudentResults)

export default resultRouter