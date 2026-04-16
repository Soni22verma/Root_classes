export const enrollCourse = async (req, res) => {
  try {
  
    const { courseId,studentId } = req.body;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // check valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Course ID",
      });
    }

    // check course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // check already enrolled
    const alreadyEnrolled = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
    });

    res.status(201).json({
      success: true,
      message: "Enrolled successfully",
      data: enrollment,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};