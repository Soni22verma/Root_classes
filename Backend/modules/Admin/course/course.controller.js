import cloudinary from "../../../config/cloudinary.js";
import { Course } from "./course.model.js";

export const CreateCourse = async (req, res, next) => {
    try {
        const {
            title,
            discreption,
            instructor,
            duration,
            price,
            level,
            tags,
        } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: "Thumbnail is required",
            });
        }

        const result = await cloudinary.uploader.upload(req.file.path);

        console.log("Cloudinary URL:", result.secure_url);

        const course = await Course.create({
            title,
            discreption,
            instructor,
            duration,
            price,
            level,
            tags: tags ? JSON.parse(tags) : [],
            thumbnail: result.secure_url,
        });

        res.status(201).json({
            message: "Course created successfully",
            data: course,
        });

    } catch (error) {
        console.log(error);
        next(error);
    }
};

export const GetAllCourse = async (req, res, next) => {
    try {
        const course = await Course.find().sort({ createdAt: -1 });

        if (!course) {
            return res.status(400).json({
                message: "courses not found",
                error: true,
                success: false
            })
        }

        return res.status(200).json({
            message: "all courses fatched successfully",
            error: false,
            success: true,
            course,
        })

    } catch (error) {
        next(error)
    }
}

export const handleCourseEdit = async (req, res, next) => {
    try {
        const { courseId, title, discreption, instructor, duration, price, level, tags } = req.body;

        console.log("BODY:", req.body); 

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(400).json({
                message: "course not found",
                error: true,
                success: false
            });
        }

        let thumbnail = course.thumbnail;

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            thumbnail = result.secure_url;
        }

        course.title = title || course.title;
        course.discreption = discreption || course.discreption;
        course.instructor = instructor || course.instructor;
        course.duration = duration || course.duration;
        course.price = price || course.price;
        course.level = level ? level.toLowerCase() : course.level;

        // ✅ FIXED TAGS
        course.tags = tags ? tags.split(",").map(tag => tag.trim()) : course.tags;

        course.thumbnail = thumbnail;

        await course.save();

        return res.status(200).json({
            message: "Courses Updated successfully",
            error: false,
            success: true,
            data: course
        });

    } catch (error) {
        console.log("ERROR:", error); // 🔥 important
        return res.status(500).json({
            message: error.message
        });
    }
};

export const handleDeleteCourse = async(req,res,next)=>{
    try {
        const{courseId} = req.body;
        if(!courseId){
            return res.status({
                message:"courseId is required",
                error:true,
                success:false
            })
        }
         const course = await Course.findById(courseId)
         if(!course){
            return res.status(404).json({
             message:"course is not found",
             error:true,
             success:false
            })
         }

         const deletedcourse =await Course.findByIdAndDelete(courseId)

         return res.status(200).json({
            message:"course delated successfully",
            error:false,
            success:true,
            deletedcourse
         })
    } catch (error) {
        next(error)
    }
}

