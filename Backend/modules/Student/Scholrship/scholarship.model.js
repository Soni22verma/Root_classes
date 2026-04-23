import mongoose from "mongoose";

const scholarshipSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ✔ 1 student = 1 scholarship
    },

    program: {
      type: String,
      enum: ["Foundation", "Medical", "Engineering"],
      required: true
    },

    studentClass: {
      type: String,
      enum: ["class-10", "class-11", "class-12", "graduate", "postgraduate"],
      required: true
    },

    lookingForCategory: {
      type: String,
      enum: ["scholarship", "admission", "counseling", "exam-prep"],
      required: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    discount: {
      type: Number,
      default: 0
    },
       
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },

    
    validFrom: {
      type: Date,
    },

    validUntil: {
      type: Date,
    },

    adminRemark: {
      type: String
    },

    isUsed: {
      type: Boolean,
      default: false   
    },

    usedAt: {
      type: Date       
    },

    usedForCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"   
    }

  },
  { timestamps: true }
);

export default mongoose.model("Scholarship", scholarshipSchema);