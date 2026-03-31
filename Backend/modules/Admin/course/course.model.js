import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        title:{
            type:String,
        },
        discreption:{
            type:String
        },
        instructor:{
            type:String
        },
        duration:{
            type:String
        },
        price:{
            type:String
        },
        level:{
          type:String,
          enum:["beginner","intermediate","advanced"]
        },
       tags:[
        {
            type:String
        }
       ],
       thumbnail:{
        type:String
       }
    },{timestamps:true}
)

export const Course = mongoose.model("Course",courseSchema)