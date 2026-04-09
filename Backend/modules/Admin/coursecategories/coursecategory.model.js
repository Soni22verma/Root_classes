import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
    {
        title:{
            type:String
        },
        video:{
            type:String
        },
        notes:{
            type:String
        },
        rating:{
            type:Number,
            default:0,
        }
    }
)

const chapterSchema = new mongoose.Schema(
    {
        title:{
            type:String
        },
        topics:[topicSchema]
    }
)
const moduleSchema = new mongoose.Schema(
    {
        title:{
            type:String
        },
        chapters:[chapterSchema]
    }
)
const courseCategotySchema = new mongoose.Schema(
    {
        category:{
            type:String
        },
        title:{
            type:String
        },
        modules:[moduleSchema]
    }
)

export const CourseCategory = mongoose.model("CourseCategory",courseCategotySchema)
