import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
    {
        student:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Student",
          
        },
        course:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course",
          
        },
        enrolledAt:{
            type:Date,
            default:Date.now,
        }
    }
)

export default mongoose.model("Enrollment",enrollmentSchema)