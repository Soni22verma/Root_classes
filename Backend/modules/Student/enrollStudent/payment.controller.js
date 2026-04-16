import crypto from "crypto";
import razorpay from "../../../config/rozorpay.js";
import { Course } from "../../instructor/createCourse/createCourse.model.js";
import { EnrollStudent } from "./enrollStudent.model.js";
import User from '../student.model.js';


export const createPayment = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;

    // Validate inputs
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

    // Check if already successfully enrolled in this course
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

    // Check for any pending enrollment for this course and student
    const existingPendingEnrollment = await EnrollStudent.findOne({
      student: studentId,
      course: courseId,
      status: "pending"
    });

    // If there's a pending enrollment, delete it to create a fresh one
    if (existingPendingEnrollment) {
      await EnrollStudent.deleteOne({ _id: existingPendingEnrollment._id });
    }

    // Create razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(course.price * 100), // Ensure it's an integer
      currency: "INR",
      receipt: `receipt_${Date.now()}_${studentId}_${courseId}`
    });

    // Create new enrollment record
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

    // Verify signature
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

    // Find enrollment - first try by enrollmentId from frontend, then by orderId
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

    // Add course to student's enrolled courses
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

// Add this new endpoint to check enrollment status
export const checkEnrollmentStatus = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    
    const enrollment = await EnrollStudent.findOne({
      student: studentId,
      course: courseId,
      status: "success"
    });
    
    res.json({
      success: true,
      isEnrolled: !!enrollment,
      enrollment
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};


// import crypto from "crypto";
// import razorpay from "../../../config/rozorpay.js";
// import { Course } from "../../instructor/createCourse/createCourse.model.js";
// import { EnrollStudent } from "./enrollStudent.model.js";
// import User from '../student.model.js';


// export const createPayment = async (req, res) => {
//   try {
//     const { courseId, studentId } = req.body;

//     // Validate inputs
//     if (!courseId || !studentId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Course ID and Student ID are required" 
//       });
//     }

//     const course = await Course.findById(courseId);
//     if (!course) {
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }

//     // Check if already successfully enrolled in this course
//     const existingSuccessfulEnrollment = await EnrollStudent.findOne({
//       student: studentId,
//       course: courseId,
//       status: "success"
//     });

//     if (existingSuccessfulEnrollment) {
//       return res.status(400).json({
//         success: false,
//         message: "You are already enrolled in this course"
//       });
//     }

//     // Check for any pending enrollment for this course and student
//     const existingPendingEnrollment = await EnrollStudent.findOne({
//       student: studentId,
//       course: courseId,
//       status: "pending"
//     });

//     // If there's a pending enrollment, delete it to create a fresh one
//     if (existingPendingEnrollment) {
//       await EnrollStudent.deleteOne({ _id: existingPendingEnrollment._id });
//     }

//     // Create a unique but short receipt (max 40 characters)
//     // Format: ENR{timestamp last 8 digits}{course last 4 chars}{student last 4 chars}
//     const timestamp = Date.now().toString().slice(-8);
//     const courseShort = courseId.slice(-4);
//     const studentShort = studentId.slice(-4);
//     const receipt = `ENR${timestamp}${courseShort}${studentShort}`;
    
//     // Ensure receipt doesn't exceed 40 characters
//     const finalReceipt = receipt.slice(0, 40);

//     // Create razorpay order
//     const order = await razorpay.orders.create({
//       amount: Math.round(course.price * 100), // Ensure it's an integer
//       currency: "INR",
//       receipt: finalReceipt,
//       notes: {
//         courseId: courseId,
//         studentId: studentId,
//         courseTitle: course.title?.slice(0, 30) // Optional: for reference
//       }
//     });

//     // Create new enrollment record
//     const enrollment = await EnrollStudent.create({
//       student: studentId,
//       course: courseId,
//       orderId: order.id,
//       amount: course.price,
//       status: "pending",
//       paymentStatus: "pending"
//     });

//     res.json({
//       success: true,
//       order,
//       enrollmentId: enrollment._id
//     });

//   } catch (error) {
//     console.error("Create payment error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.error?.description || error.message || "Failed to create payment" 
//     });
//   }
// };


// export const verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       enrollmentId
//     } = req.body;

//     // Verify signature
//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid signature",
//       });
//     }

//     // Find enrollment - first try by enrollmentId from frontend, then by orderId
//     let enrollment = null;
    
//     if (enrollmentId) {
//       enrollment = await EnrollStudent.findById(enrollmentId);
//     }
    
//     if (!enrollment) {
//       enrollment = await EnrollStudent.findOne({
//         orderId: razorpay_order_id
//       });
//     }

//     if (!enrollment) {
//       return res.status(404).json({
//         success: false,
//         message: "Enrollment not found",
//       });
//     }

//     // Check if already processed
//     if (enrollment.status === "success") {
//       return res.json({
//         success: true,
//         message: "Payment already verified",
//         data: enrollment
//       });
//     }

//     // Update enrollment with payment details
//     enrollment.paymentId = razorpay_payment_id;
//     enrollment.signature = razorpay_signature;
//     enrollment.status = "success";
//     enrollment.paymentStatus = "success";
//     enrollment.enrolledAt = new Date();
//     await enrollment.save();

//     // Add course to student's enrolled courses
//     await User.findByIdAndUpdate(
//       enrollment.student, 
//       { 
//         $addToSet: { enrolledCourses: enrollment.course } 
//       },
//       { new: true }
//     );

//     res.json({
//       success: true,
//       message: "Payment successful and enrollment completed",
//       data: enrollment
//     });

//   } catch (error) {
//     console.error("Verify payment error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || "Payment verification failed" 
//     });
//   }
// };

// // Add this new endpoint to check enrollment status
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