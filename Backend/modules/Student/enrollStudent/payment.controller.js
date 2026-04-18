import crypto from "crypto";
import razorpay from "../../../config/rozorpay.js";
import { Course } from "../../instructor/createCourse/createCourse.model.js";
import { EnrollStudent } from "./enrollStudent.model.js";
import User from '../student.model.js';

export const createPayment = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;

    if (!courseId || !studentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Course ID and Student ID are required" 
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const existingSuccessfulEnrollment = await EnrollStudent.findOne({
      student: studentId,
      course: courseId,
      status: "success"
    });

    if (existingSuccessfulEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course"
      });
    }

    // Clean up any pending enrollment for THIS SPECIFIC course
    const existingPendingEnrollment = await EnrollStudent.findOne({
      student: studentId,
      course: courseId,
      status: "pending"
    });

    if (existingPendingEnrollment) {
      await EnrollStudent.deleteOne({ _id: existingPendingEnrollment._id });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(course.price * 100), 
      currency: "INR",
     receipt: `rcpt_${Date.now().toString().slice(-10)}`
    });

    const enrollment = await EnrollStudent.create({
      student: studentId,
      course: courseId,
      orderId: order.id,
      amount: course.price,
      status: "pending",
      paymentStatus: "pending"
    });

    res.json({
      success: true,
      order,
      enrollmentId: enrollment._id
    });

  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create payment" 
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      enrollmentId
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    let enrollment = null;
    
    if (enrollmentId) {
      enrollment = await EnrollStudent.findById(enrollmentId);
    }
    
    if (!enrollment) {
      enrollment = await EnrollStudent.findOne({
        orderId: razorpay_order_id
      });
    }

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Check if already processed
    if (enrollment.status === "success") {
      return res.json({
        success: true,
        message: "Payment already verified",
        data: enrollment
      });
    }

    // Update enrollment with payment details
    enrollment.paymentId = razorpay_payment_id;
    enrollment.signature = razorpay_signature;
    enrollment.status = "success";
    enrollment.paymentStatus = "success";
    enrollment.enrolledAt = new Date();
    await enrollment.save();

    // Add course to student's enrolled courses (using $addToSet to prevent duplicates)
    await User.findByIdAndUpdate(
      enrollment.student, 
      { 
        $addToSet: { enrolledCourses: enrollment.course } 
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Payment successful and enrollment completed",
      data: enrollment
    });

  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Payment verification failed" 
    });
  }
};

// // Check enrollment status for a specific course
// export const checkEnrollmentStatus = async (req, res) => {
//   try {
//     const { studentId, courseId } = req.params;
    
//     const enrollment = await EnrollStudent.findOne({
//       student: studentId,
//       course: courseId,
//       status: "success"
//     });
    
//     res.json({
//       success: true,
//       isEnrolled: !!enrollment,
//       enrollment
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// export const getStudentEnrollments = async (req, res) => {
//   try {
//     const { studentId } = req.params;
    
//     const enrollments = await EnrollStudent.find({
//       student: studentId,
//       status: "success"
//     }).populate('course');
    
//     res.json({
//       success: true,
//       data: enrollments
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };


export const GetMyCourse = async(req,res,next)=>{
  try {
    const {studentId} = req.body;
    console.log(studentId , "fghjkl;ghjkl;jjjjjjjjjjjjjjjj")
     
    const enrollment = await EnrollStudent.find({
      student:studentId,
      paymentStatus:"success"
    })
    .populate("course")

    return res.status(200).json({
      message:"get all my purches",
      error:false,
      success:true,
      data:enrollment,
    })
    
    
  } catch (error) {
    next(error)
  }
}