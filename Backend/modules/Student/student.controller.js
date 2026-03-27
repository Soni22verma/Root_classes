import { Student } from "./student.model.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const RegisterStudent = async (req, res) => {
    try {
        const { fullName, email, password, dateofBirth, gender, currentClass, interestedCourse, address } = req.body;
      

        if (!fullName || !email || !password || !dateofBirth || !gender || !currentClass || !interestedCourse || !address) {
            return res.status(400).json({
                message: "fill required fields",
                error: true,
                success: false
            })
        }

        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({
                message: "student already registered",
                error: true,
                success: false
            })
        }
          const hash = await bcrypt.hash(password, 10);

        const student = await Student.create({
            fullName,
            email,
            password : hash,
            dateofBirth,
            gender,
            currentClass,
            interestedCourse,
            address,
        })
          const token = generateToken(student._id);

        return res.status(200).json({
            message:"Student registerd successfully",
            token,
            student,
        })

    } catch (error) {
      return res.status(500).json({
        message:"Server Error",
        error:true
      })
    }
}

export const handleLogin = async(req,res)=>{
    try {
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message:"fill required fields",
                error:true,
                success:false
            })
        }

        const student = await Student.findOne({email})
        if(!student){
            return res.status(400).json({
                message:"Invalid email and password",
                error:true,
                success:false
            })
        }

        const isMatch = await bcrypt.compare(password,student.password)
        if(!isMatch){
            return res.status(400).json({
                message:"email and password not matched",
                error:true,
                success:false
            })
        }

         const token = generateToken(student._id)
         return res.status(200).json({
            message:"Login Successfully",
            error:false,
            success:true,
            token,
            student,
         })

        
    } catch (error) {
       console.log(error)
        return res.status(500).json({
        message:"Server Error",
        error:true
      }) 
    }
}