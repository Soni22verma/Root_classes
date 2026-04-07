import enrollmentModel from "./enrollment.model.js";

export const enrollCourse = async(req,res,next)=>{
    try {
        const {studentId,courseId} = req.body;
        if(!studentId){
            return res.status(400).json({
                message:"Student ID is required",
                error:true,
                success:false
            })
        }

        if(!courseId){
            return res.status(400).json({
                message:"Course ID is required",
                error:true,
                success:false
            })
        }

        const alreadyEnrolled = await enrollmentModel.findOne({
            student:studentId,
            course:courseId
        })

        if(alreadyEnrolled){
            return res.status(400).json({
                message:"you are already enroll in this course",

            })
        }
        const enrollment = await enrollmentModel.create({
            student:studentId,
            course:courseId
        })

        return res.status(200).json({
            message:"Enrollment successfully",
            error:false,
            success:true,
            enrollment,
        })
        
    } catch (error) {
        next(error)
    }
}

export const GetEnrollments = async(req,res,next)=>{
    try {
        const {studentId}=req.body;
        console.log(req.body,"hhhhhhhhhhhhhhhhhhh")
        const enrollments = await enrollmentModel.find({student:studentId}).populate("course")

        return res.status(200).json({
            message:"All enrolled students fatched successfully",
            error:false,
            success:true,
            enrollments
        })
        
    } catch (error) {
        next(error)
    }
}

export const GetAllEnrollments = async (req, res, next) => {
  try {
    const enrollments = await enrollmentModel
      .find()
      .populate({
        path: "student",
        select: "fullName email profileImage phone address currentClass gender" 
      })
      .populate({
        path: "course",
        select: "title thumbnail level price duration instructor discreption"
      });

    return res.status(200).json({
      message: "All enrolled students fetched successfully",
      error: false,
      success: true,
      enrollments,
    });

  } catch (error) {
    next(error);
  }
};



