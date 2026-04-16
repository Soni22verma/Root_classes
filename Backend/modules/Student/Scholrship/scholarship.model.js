import mongoose from "mongoose";

const scholarshipSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // agar aapka alag Student model hai
      required: true
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
    }
  },
  { timestamps: true }
);

export default mongoose.model("Scholarship", scholarshipSchema);