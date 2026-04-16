import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema(
    {
        title: {
            type: String
        },
        subtitle: {
            type: String
        },
        buttonText: {
            type: String
        },
        image: {
            type: String
        },
        classText: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }, { timestamps: true }
)

export const Slider = mongoose.model("Slider", sliderSchema)