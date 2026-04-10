import mongoose from "mongoose";
import { Course } from "./createCourse.model.js";
import { Category } from "../../Admin/category/category.model.js";

export const createCourse = async (req, res) => {
  try {
    const { title, description, category, level } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: "Title and Category are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Category ID",
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const course = await Course.create({
      title,
      description,
      category,
      level: level || "beginner",
      instructor: req.user?._id, 
      modules: [],
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const GetCategory = async(req,res,next)=>{
    try {
        const categories = await Category.find().select("name")
        return res.status(200).json({
            message:"this is categories",
            success:true,
            data:categories
        })
        
    } catch (error) {
        next(error)
    }
}
export const GetCreatedCourse = async(req,res,next)=>{
    try {
        const CreatedCourse = await Course.find()
        return res.status(200).json({
            message:"fatch all course successfully",
            error:false,
            success:true,
            data:CreatedCourse
        })
        
    } catch (error) {
        next(error)
    }
}



export const UpdateCourse = async (req, res, next) => {
  try {
    const { courseId, title, description, category, level } = req.body;

    // 🔥 1. Check courseId
    if (!courseId) {
      return res.status(400).json({
        message: "Course ID is required",
        error: true,
        success: false,
      });
    }

    // 🔥 2. Check course exists
    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
        error: true,
        success: false,
      });
    }

    // 🔥 3. Optional: Validate category
    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        message: "Invalid category ID",
        success: false,
        error: true,
      });
    }

    // 🔥 4. Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        title: title || existingCourse.title,
        description: description || existingCourse.description,
        category: category || existingCourse.category,
        level: level || existingCourse.level,
      },
      { returnDocument: "after" }
    );

    // 🔥 5. Send response
    res.status(200).json({
      message: "Course updated successfully",
      success: true,
      error: false,
      data: updatedCourse,
    });

  } catch (error) {
    next(error);
  }
};

export const DeleteCourse = async(req,res,next)=>{
    try {
        const {courseId} = req.body;
        const deletecourse = await Course.findByIdAndDelete(courseId)
        return res.status(200).json({
            message:"course deleted successfully",
            error:false,
            success:true,
            data:deletecourse
        })

        
    } catch (error) {
       next(error)  
    }
}