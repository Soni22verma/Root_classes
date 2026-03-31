import { Student } from "../Student/student.model.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};
export const AdminLogin = async(req,res,next) => {
    try {
        const{email,password} = req.body

        if(!email || !password){
            return res.status(400).json({
                message:"fill required fields",
                error:true,
                success:false
            })
        }

        const student = await Student.findOne({email});
        if(!student){
            return res.status(404).json({
                message:"Invalid email and password",
                error:true,
                success:false
            })
        }

        if(student.role !== "admin"){
            return res.status(400).json({
                message:"Access denied. Not an Admin",
                error:true,
                success:false
            })
        }

        const isMatch = await bcrypt.compare(password,student.password);
        if(!isMatch){
            return res.status(400).json({
                message:"Invalid email and password",
                error:true,
                success:false
            })
        }

        const token = generateToken(student._id)

        return res.status(200).json({
            message:"Admin Login successfully",
            error:false,
            success:true,
            token,
            student,
        })
    } catch (error) {
      next(error)
    }
}

export const getAllStudent = async(req,res,next)=>{
    try {
        const student = await Student.find({role:"student"})

        return res.status(200).json({
            message:"All student fatched Successfully",
            error:false,
            success:true,
            data:student
        })
        
    } catch (error) {
        next(error)
    }
}