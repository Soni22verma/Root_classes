import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import cloudinary from "../../config/cloudinary.js";
import  User  from './student.model.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};


export const Registeruser = async (req, res) => {
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
    const existinguser = await User.findOne({ email });
    if (existinguser) {
      return res.status(400).json({
        message: "user already registered",
        error: true,
        success: false
      });
    }

    // ✅ Hash password
    const hash = await bcrypt.hash(password, 10);

    // ✅ Create user (role FIXED here)
    const user = await User.create({
      fullName,
      email,
      password: hash,
      role: "student", 
      dateofBirth,
      gender,
      currentClass,
      interestedCourse,
      address,
      phone,
    });

    // ✅ Generate token
    const token = generateToken(user._id);

    return res.status(201).json({
      message: "user registered successfully",
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        error: true,
        success: false
      });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
        error: true,
        success: false
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role || "user" // 🔥 fallback
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
        const userId = req.body.userId;

     

        const updateduser = await User.findByIdAndUpdate(
            userId,
            {
                profileImage: imageUrl,

            },
            { new: true }
        );
        

        return res.status(200).json({
            message: "Profile Updated successfully",
            error: false,
            success: true,
            updateduser,
        })

    } catch (error) {
        return res.status(500).json({
            message: "something error",
            error: true,
            success: false
        })
    }
}

export const Getuser = async (req, res) => {
  try {
    const { userId } = req.body;
   
    if (!userId) {
      return res.status(400).json({
        message: "user ID is required",
        success: false,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "user not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "user fetched successfully",
      success: true,
      user,
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
       const{userId,fullName, email,  password, dateofBirth, gender, currentClass, 
interestedCourse, address,phone} = req.body;
       if(!userId){
        return res.status(400).json({
            message:"userId is required",
            error:true,
            success:false
        })
       }

       const user = await User.findByIdAndUpdate(userId,{
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
       if(!user){
        return res.status(404).json({
            message:"user not found",
            error:true,
            success:false
        })
       }

       return res.status(200).json({
          message:"user profile details updated successfully",
          error:false,
          success:true,
          user
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