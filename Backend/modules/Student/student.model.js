import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
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

        profileImage: {
            type: String, 
        },
    },
    { timestamps: true }
)
export const Student = mongoose.model('Student', studentSchema)