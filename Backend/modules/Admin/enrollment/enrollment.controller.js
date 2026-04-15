import Enrollment from './enrollment.model.js'

export const getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("student", "fullName email")
      .populate("course", "title description level");

    res.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};