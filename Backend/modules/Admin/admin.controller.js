import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import  User  from '../Student/student.model.js';


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};
export const AdminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("req.body............................", req.body)

    if (!email || !password) {
      return res.status(400).json({
        message: "fill required fields",
        error: true,
        success: false,
      });
    }

    const user = await User.findOne({ email }); 
    console.log(user , "mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm")
    if (!user) {
      return res.status(404).json({
        message: "Invalid email and password",
        error: true,
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: " password not match  for admin",
        error: true,
        success: false,
      });
    }

    if (
      user.role !== "admin" &&
      user.role !== "instructor"
    ) {
      return res.status(403).json({
        message: "Access denied",
        error: true,
        success: false,
      });
    }

 

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successfully",
      error: false,
      success: true,
      token,
      user,
    });

  } catch (error) {
    next(error);
  }
};

export const getAllStudent = async(req,res,next)=>{
    try {
        const student = await User.find({role:"student"})

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