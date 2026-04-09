import cloudinary from "../../../config/cloudinary.js";
import { Slider } from "./slider.model.js";

export const CreateSlider = async (req, res, next) => {
    try {
        const { title, subtitle, buttonText, classText } = req.body;

        if (!title || !subtitle || !buttonText || !classText) {
            return res.status(400).json({
                message: "fill required fields",
                error: true,
                success: false
            })
        }

        if (!req.file) {
            return res.status(400).json({
                message: "image is required",
            });
        }


        const result = await cloudinary.uploader.upload(req.file.path);

        console.log("Cloudinary URL:", result.secure_url);

        const  slider = await Slider.create({
            title,
            subtitle,
            buttonText,
            classText,
            image:result.secure_url
        })

        return res.status(200).json({
            message:"slider created successfully",
            error:false,
            success:true,
            data:slider
        })

    } catch (error) {
      next(true)
    }
}

export const GetSlider = async(req,res,next)=>{
    try {
        const allslider = await Slider.find()

        return res.status(200).json({
            message:"ALl slider fatched successfully",
            error:false,
            success:true,
            data:allslider
        })
        
    } catch (error) {
        next(error)
    }
}

export const UpdateSlider = async(req,res,next)=>{
    try {
        const {sliderId,title, subtitle, buttonText, classText} = req.body;
        if(!sliderId){
            return res.status(400).json({
                message:"slider Id is required",
                error:true,
                success:false
            })
        }

        const existingSlider = await Slider.findById(sliderId)
        if(!existingSlider){
            return res.status(404).json({
                message:"slider not found",
                error:true,
                success:false

            })
        }
        let imageUrl = existingSlider.image;
                if (req.file) {
                    const result = await cloudinary.uploader.upload(req.file.path);
                    imageUrl = result.secure_url;
                }

        const editSlider = await Slider.findByIdAndUpdate(sliderId,{
            title: title || existingSlider.title, 
            subtitle: subtitle || existingSlider.subtitle,
             buttonText: buttonText || existingSlider.buttonText, 
             classText: classText || existingSlider.classText,
             image:imageUrl
        },{new:true})

        return res.status(200).json({
            message:"Slider Updated successgully",
            error:false,
            success:true,
            data:editSlider
        })
        
    } catch (error) {
        
    }
}

export const DeleteSlider = async(req,res,next)=>{
    try {
        const {sliderId} = req.body;
        if(!sliderId){
            return res.status(400).json({
                message:"Slider Id is required",
                error:true,
                success:false
            })
        }
         
    const deleteslider = await Slider.findByIdAndDelete(sliderId)
    
    return res.status(200).json({
        message:"Slider deleted successfully",
        error:false,
        success:true,
        data:deleteslider
    })

    } catch (error) {
      next(error)  
    }
}

