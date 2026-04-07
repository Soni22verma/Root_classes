import cloudinary from "../../../config/cloudinary.js";
import { Topic } from "./topics.model.js";
import fs from 'fs'

export const addTopic = async (req, res, next) => {
    try {
        const { classId, title, description } = req.body;
        if (!classId) {
            return res.status(400).json({
                message: "classId is required",
                error: true,
                success: false
            })
        }

        let videoUrls = [];
        let notes = [];

        if (req.files?.videos) {
            for (let file of req.files.videos) {
                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: "video"
                });
                videoUrls.push(result.secure_url);

                fs.unlinkSync(file.path);
            }
        }

        if (req.files?.notes) {
            for (let file of req.files.notes) {
                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: "raw",
                    type: "upload"
                });

                notes.push({
                    title: file.originalname,
                    fileUrl: result.secure_url
                });
                fs.unlinkSync(file.path);
            }
        }

        const topics = await Topic.create({
            classId,
            title,
            description,
            videoUrls,
            notes
        })
        return res.status(200).json({
            message: "Topic created successfully",
            error: false,
            success: true,
            data: topics
        })

    } catch (error) {
        next(error)
    }
}


export const getTopicsByClass = async (req, res, next) => {
    try {

        const topic = await Topic.find().populate("classId")


        if (!topic || topic.length === 0) {
            return res.status(404).json({
                message: "No topics found",
                error: true,
                success: false
            })
        }

        return res.status(200).json({
            message: "topics fatch successfully",
            error: false,
            success: true,
            data: topic
        })

    } catch (error) {
        next(error)
    }
}

export const UpdateTopic = async (req, res, next) => {
    try {
        const { topicId, title, description } = req.body;

        if (!topicId) {
            return res.status(400).json({
                message: "topicId is not found",
                error: true,
                success: false
            })
        }

        const topic = await Topic.findById(topicId);

        if (!topic) {
            return res.status(400).json({
                message: "topic not found",
                error: true,
                success: false
            })
        }

        if (title) topic.title = title;
        if (description) topic.description = description;

        if (req.files?.videos) {
            let newVideos = [];
            for (let file of req.files.videos) {
                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: "video"
                });

                newVideos.push(result.secure_url);
                fs.unlinkSync(file.path);
            }

            topic.videoUrls = [...topic.videoUrls, ...newVideos];
        }

        if(req.files?.notes){
            let newNotes = [];

            for(let file of req.files.notes){
                const result = await cloudinary.uploader.upload(file.path,{
                    resource_type: "raw"
                });
                newNotes.push({
                    title: file.originalname,
                    fileUrl: result.secure_url
                });
                      fs.unlinkSync(file.path);
            }
             topic.notes = [...topic.notes, ...newNotes];
        }

        await topic.save();

        return res.status(200).json({
            message:"Topic Updated Successfully",
            error:false,
            success:true,
            data:topic
        })

    } catch (error) {
      next(error)
    }
}


export const DeleteTopic = async(req,res,next)=>{
    try {
        const {topicId} = req.body;

        if(!topicId){
            return res.status(400).json({
                message:"topic Id is required",
                error:true,
                success:false
            })
        }

        const topic = await Topic.findById(topicId)
      if(!topic){
        return res.status(404).json({
            message:"topic is not found",
            error:true,
            success:false
        })
      }

      const deletetopic = await Topic.findByIdAndDelete(topicId)

      return res.status(200).json({
        message:"Topic deleted successfully",
        error:false,
        success:true,
        data:deletetopic
      })

        
    } catch (error) {
        console.log(error)
    }
}

export const getClassTopic = async(req,res,next)=>{
    try {
        const {classId} = req.body;
        if(!classId){
            return res.status(400).json({
                message:"classId is required",
                error:true,
                success:false
            })
        }

        const topics = await Topic.find({classId})
        return res.status(200).json({
            message:"topic fatch successfully",
            error:true,
            success:false,
            data:topics
        })

    
        
    } catch (error) {
        next(error)
    }
}