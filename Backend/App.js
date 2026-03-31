import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectdb from "./config/connectdb.js";

import studentRouter from "./modules/Student/student.routes.js";
import adminRouter from "./modules/Admin/admin.routes.js";
import courseRouter from "./modules/Admin/course/course.routes.js";
import enrollRouter from "./modules/Admin/enrollment/enrollment.routes.js";

dotenv.config();

const app = express();

// DB connect
connectdb();

// Middleware
app.use(cors({
  origin: "*",
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/student", studentRouter);
app.use("/admin", adminRouter);
app.use("/course",courseRouter)
app.use("/enroll",enrollRouter)

// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

export default app;