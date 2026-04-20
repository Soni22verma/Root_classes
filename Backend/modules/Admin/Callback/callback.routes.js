import express from "express";
import { RequestExpertAdvice } from "./callback.controller.js";

const router = express.Router();

router.post("/request", RequestExpertAdvice);

export default router;
