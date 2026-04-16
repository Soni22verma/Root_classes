import express, { Router } from 'express'
import { submitTest } from './result.controller.js'

const resultRouter = Router()

resultRouter.post('/submit_test',submitTest)

export default resultRouter