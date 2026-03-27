

import express from "express"
import dotenv from 'dotenv'
import cors from 'cors'
import connectdb from './config/connectdb.js'
import studentRouter from "./modules/Student/student.routes.js"


dotenv.config()
connectdb()
const app=express()
app.use(cors({
    origin:"*",
}));
app.use(express.json())


const PORT=process.env.PORT ||5050

app.get("/",(req,res)=>{
    res.send("server is running");
})
app.use('/student',studentRouter)

app.listen(PORT,()=>{
    console.log("server is listening")
})