import crypto from "crypto";
import Enrollment from './enrollment.model.js'
import razorpay from "../../../config/rozorpay.js";

export const createPayment = async (req, res) => {
  try {
    const { courseId, amount } = req.body;

    const alreadyEnrolled = await Enrollment.findOne({
      student: req.user?.id,
      course: courseId,
      status: "success",
    });

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      amount,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
      amount,
      status: "success",
    });

    res.json({
      success: true,
      message: "Payment successful & enrolled",
      enrollment,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};