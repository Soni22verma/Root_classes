import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectdb from "./config/connectdb.js";

import studentRouter from "./modules/Student/student.routes.js";
import adminRouter from "./modules/Admin/admin.routes.js";
import classRouter from "./modules/Admin/onlinecourse/onlinecourse.routes.js";
import attendanceRouter from "./modules/Admin/Attendance/attendance.routes.js";
import blogRouter from "./modules/Admin/blogs/blog.routes.js";
import sliderRouter from "./modules/Admin/Slider/slider.routes.js";
import testimonialRouter from "./modules/Admin/Testimonial/testimonial.routes.js";
import instructorRouter from "./modules/instructor/instructor.routes.js";
import categoryRouter from "./modules/Admin/category/category.routes.js";
import createcourseRouter from "./modules/instructor/createCourse/createCourse.routes.js";
import testRouter from "./modules/Admin/CreateTest/createtest.routes.js";
import resultRouter from "./modules/Student/Result/result.routes.js";
import enrollmentRouter from "./modules/Admin/enrollment/enrollment.routes.js";
import paymentRouter from "./modules/Admin/enrollment/payment.routes.js";

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
app.use("/api/student", studentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/instructor",instructorRouter)
app.use("/api/onlineClass",classRouter)
app.use("/api/joinclass",attendanceRouter)
app.use("/api/blog",blogRouter)
app.use("/api/slider",sliderRouter)
app.use("/api/testimonial",testimonialRouter)
app.use("/api/category",categoryRouter)
app.use("/api/course",createcourseRouter)
app.use("/api/enroll",enrollmentRouter)
app.use("/api/test",testRouter)
app.use("/api/result",resultRouter)
app.use("/api/payment",paymentRouter)


// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

export default app;