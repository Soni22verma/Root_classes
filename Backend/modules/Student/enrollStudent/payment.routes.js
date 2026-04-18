import express, { Router } from 'express'
import { createPayment, GetMyCourse, verifyPayment } from './payment.controller.js'

const paymentRouter = Router()

paymentRouter.post('/api/create-payment',createPayment)
paymentRouter.post('/api/verify-payment',verifyPayment)
paymentRouter.post("/api/get-my-course",GetMyCourse)

export default paymentRouter