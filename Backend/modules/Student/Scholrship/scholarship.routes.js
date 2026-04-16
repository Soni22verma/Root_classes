import { Router } from "express";
import { handleApplyScholarship } from "./scholarship.controller.js";


const scholarshipRouter = Router()

scholarshipRouter.post("/apply" ,handleApplyScholarship)


export default scholarshipRouter