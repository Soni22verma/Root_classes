import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true
  },
  score: Number,
  percentage: Number,
  isEligible: Boolean
}, { timestamps: true });

export const Result = mongoose.model("Result", resultSchema);