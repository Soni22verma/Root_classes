import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,

        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String
        },
        dateofBirth: {
            type: String
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],

        },
        currentClass: {
            type: String,

        },
        interestedCourse: {
            type: String,

        },
        address: {
            type: String,

        },
        phone: {
            type: String,
        },

        profileImage: {
            type: String,
        },
        role: {
            type: String,
            enum: ["student", "admin", "instructor"],
            default: "student"
        },
        otp: {
            type: String,
        },
        expiredAt: {
            type: Date,
        },

        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
        ],


    },
    { timestamps: true }
)
export default mongoose.model('User', userSchema)
