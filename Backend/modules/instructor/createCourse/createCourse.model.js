import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  notes: { type: String },
  videoUrl: { type: String }, // video link
  createdAt: { type: Date, default: Date.now },
});

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topics: [topicSchema],
  createdAt: { type: Date, default: Date.now },
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  chapters: [chapterSchema],
  createdAt: { type: Date, default: Date.now },
});

const courseSchema = new mongoose.Schema({
  title: { type: String},
  description: { type: String },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  
  },

  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",

  },

  duration: { type: String },
  price: { type: Number },

  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  },



  modules: [moduleSchema],

  createdAt: { type: Date, default: Date.now },
});

export const Course= mongoose.model("Course", courseSchema);