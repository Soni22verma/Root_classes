import { Student } from "./student.model.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import cloudinary from "../../config/cloudinary.js";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};


export const RegisterStudent = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      dateofBirth,
      gender,
      currentClass,
      interestedCourse,
      address,
      phone
    } = req.body;

    // ✅ Validation
    if (
      !fullName || !email || !password || !dateofBirth ||
      !gender || !currentClass || !interestedCourse ||
      !address || !phone
    ) {
      return res.status(400).json({
        message: "All fields are required",
        error: true,
        success: false
      });
    }

    // ✅ Check existing user
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        message: "Student already registered",
        error: true,
        success: false
      });
    }

    // ✅ Hash password
    const hash = await bcrypt.hash(password, 10);

    // ✅ Create student (role FIXED here)
    const student = await Student.create({
      fullName,
      email,
      password: hash,
      role: "student", // 🔥 IMPORTANT
      dateofBirth,
      gender,
      currentClass,
      interestedCourse,
      address,
      phone,
    });

    // ✅ Generate token
    const token = generateToken(student._id);

    return res.status(201).json({
      message: "Student registered successfully",
      success: true,
      token,
      user: {
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        role: student.role
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server Error",
      error: true
    });
  }
};



export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        error: true,
        success: false
      });
    }

    // ✅ Find user
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({
        message: "Invalid email or password",
        error: true,
        success: false
      });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
        error: true,
        success: false
      });
    }

    const token = generateToken(student._id);

    return res.status(200).json({
      message: "Login successful",
      success: true,
      token,
      user: {
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        role: student.role || "student" // 🔥 fallback
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server Error",
      error: true
    });
  }
};

export const handleStdProfile = async (req, res) => {
    try {
        let imageUrl = "";

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            console.log(result)
            imageUrl = result.secure_url;

        }
        const studentId = req.body.studentId;

     

        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            {
                profileImage: imageUrl,

            },
            { new: true }
        );
        

        return res.status(200).json({
            message: "Profile Updated successfully",
            error: false,
            success: true,
            updatedStudent,
        })

    } catch (error) {
        return res.status(500).json({
            message: "something error",
            error: true,
            success: false
        })
    }
}

export const GetStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
   
    if (!studentId) {
      return res.status(400).json({
        message: "Student ID is required",
        success: false,
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Student fetched successfully",
      success: true,
      student,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const EditProfileDetails = async(req,res)=>{
    try {
       const{studentId,fullName, email,  password, dateofBirth, gender, currentClass, 
interestedCourse, address,phone} = req.body;
       if(!studentId){
        return res.status(400).json({
            message:"StudentId is required",
            error:true,
            success:false
        })
       }

       const student = await Student.findByIdAndUpdate(studentId,{
        fullName,
         email, 
         password, 
         dateofBirth, 
         gender, 
         currentClass, 
         interestedCourse, 
         address,
         phone 
       },{new:true});
       if(!student){
        return res.status(404).json({
            message:"student not found",
            error:true,
            success:false
        })
       }

       return res.status(200).json({
          message:"Student profile details updated successfully",
          error:false,
          success:true,
          student
       })
   
    } catch (error) {
       console.log(error)
       return res.status(500).json({
        message:"somthing error",
        success:false,
        error:true
       })  
    }
}