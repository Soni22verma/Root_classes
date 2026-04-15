import express, { Router } from 'express'
import { createPayment, verifyPayment } from './payment.controller.js'

const paymentRouter = Router()

paymentRouter.post('/create-payment',createPayment)
paymentRouter.post('/verify-payment',verifyPayment)

export default paymentRouter