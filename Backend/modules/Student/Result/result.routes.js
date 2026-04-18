import express, { Router } from 'express'
import { checkTestAttempt, submitTest } from './result.controller.js'

const resultRouter = Router()

resultRouter.post('/submit_test',submitTest)
resultRouter.post("/check-existing-test",checkTestAttempt)

export default resultRouter