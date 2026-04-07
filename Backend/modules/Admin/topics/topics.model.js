import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OnlineClass",
            required: true
        },
        title: {
            type: String,
            trim: true
        },
        description: {
            type: String
        },
        videoUrls: [
            {
                type: String
            }
        ],

        notes: [
            {
                title: String,
                fileUrl: String
            }
        ],
        isCompleted: {
            type: Boolean,
            default: false
        }
    }, { timestamps: true }
)

export const Topic = mongoose.model("Topic", topicSchema)