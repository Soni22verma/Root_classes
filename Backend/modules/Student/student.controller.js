import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import cloudinary from "../../config/cloudinary.js";
import  User  from './student.model.js';
import sendOTP from '../../config/emailServices.js';

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
            imageUrl = result.secure_url;
            console.log(imageUrl , " skkkskskskskskskskssk")

        }
        const studentId = req.body.studentId;

     

        const updateduser = await User.findByIdAndUpdate(
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
    // console.log("sssssssssssssssss")
    
    if (typeof console !== 'object') {
      console.error("Console object is corrupted!");
    }
    
    if (typeof console.log !== 'function') {
      // Fallback if console.log is broken
      const originalError = console.error;
      console.error = function(msg) { originalError(msg); };
    }
    
    const { studentId } = req.body;

    if (!studentId){
      return res.status(400).json({
        message: "user ID is required",
        success: false,
      });
    }

    const user = await User.findById(studentId);
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
            message:"userId is required",
            error:true,
            success:false
        })
       }

       const user = await User.findByIdAndUpdate(studentId,{
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



const otpStore = new Map();

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP endpoint
export const sendOTPEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const otp = generateOTP();
        
        otpStore.set(email, {
            otp: otp,
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        const emailSent = await sendOTP(email, otp);

        if (emailSent) {
            return res.status(200).json({
                success: true,
                message: 'OTP sent successfully to your email'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP'
            });
        }
    } catch (error) {
        console.error('Error in sendOTPEmail:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: 'OTP not found. Please request a new one.'
            });
        }

        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Check if OTP matches
        if (storedData.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // OTP is valid, delete it from store
        otpStore.delete(email);

        return res.status(200).json({
            success: true,
            message: 'OTP verified successfully'
        });

    } catch (error) {
        console.error('Error in verifyOTP:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// Add these to your existing auth controllers file

// Forgot Password - Send OTP
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if user exists with this email
        const user = await User.findOne({ email }); // Adjust based on your user model
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email'
            });
        }

        const otp = generateOTP();
        
        otpStore.set(email, {
            otp: otp,
            expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
            purpose: 'password_reset'
        });

        const emailSent = await sendOTP(email, otp);

        if (emailSent) {
            return res.status(200).json({
                success: true,
                message: 'OTP sent successfully to your email'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP'
            });
        }
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: 'OTP not found. Please request a new one.'
            });
        }

        if (storedData.purpose !== 'password_reset') {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP purpose'
            });
        }

        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Update user password
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.password = await hashPassword(newPassword);
        await user.save();

        otpStore.delete(email);

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};