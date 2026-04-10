import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectdb from "./config/connectdb.js";

import studentRouter from "./modules/Student/student.routes.js";
import adminRouter from "./modules/Admin/admin.routes.js";
import enrollRouter from "./modules/Admin/enrollment/enrollment.routes.js";
import classRouter from "./modules/Admin/onlinecourse/onlinecourse.routes.js";
import attendanceRouter from "./modules/Admin/Attendance/attendance.routes.js";
import blogRouter from "./modules/Admin/blogs/blog.routes.js";
import sliderRouter from "./modules/Admin/Slider/slider.routes.js";
import testimonialRouter from "./modules/Admin/Testimonial/testimonial.routes.js";
import courseCategotyRouter from "./modules/Admin/coursecategories/coursecategory.routes.js";
import instructorRouter from "./modules/instructor/instructor.routes.js";
import categoryRouter from "./modules/Admin/category/category.routes.js";
import createcourseRouter from "./modules/instructor/createCourse/createCourse.routes.js";

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
app.use("/instructor",instructorRouter)
app.use("/enroll",enrollRouter)
app.use("/onlineClass",classRouter)
app.use("/joinclass",attendanceRouter)
app.use("/blog",blogRouter)
app.use("/slider",sliderRouter)
app.use("/testimonial",testimonialRouter)
app.use("/fullcourse",courseCategotyRouter)
app.use("/category",categoryRouter)
app.use("/course",createcourseRouter)
// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

export default app;