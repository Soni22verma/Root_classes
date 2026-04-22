import { Test } from "../../Admin/CreateTest/createtest.model.js";
import { Result } from "./result.model.js";

export const submitTest = async (req, res) => {
  try {
    const { studentId, testId, answers } = req.body;

    console.log('Received submission:', { studentId, testId, answers });

    // Find the test
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    const alreadyAttempted = await Result.findOne({ studentId, testId });
    if (alreadyAttempted) {
      return res.status(400).json({
        success: false,
        message: "You have already completed this test. You cannot retake it.",
      });
    }

    let obtainedMarks = 0;
    let totalMarks = 0;
    const formattedAnswers = [];

    test.questions.forEach((q) => {
      totalMarks += q.marks;

      const questionIdStr = q._id.toString();
      const userAnswer = answers[questionIdStr];

      const isCorrect =
        userAnswer !== undefined &&
        q.options[Number(userAnswer)]?.trim() === q.correctAnswer.trim();

      if (isCorrect) {
        obtainedMarks += q.marks;
      }

      formattedAnswers.push({
        questionId: q._id,
        selectedAnswer: userAnswer !== undefined ? String(userAnswer) : null,
        isCorrect: isCorrect,
      });
    });

    const percentage = (obtainedMarks / totalMarks) * 100;
    const isEligible = percentage >= 70;

    console.log(`Total Marks: ${totalMarks}, Obtained: ${obtainedMarks}, Percentage: ${percentage}%`);

    const result = await Result.create({
      studentId,
      testId,
      obtainedMarks,
      totalMarks,
      percentage,
      isEligible,
      isCompleted: true,
      answers: formattedAnswers,
    });

    res.status(200).json({
      success: true,
      message: "Test submitted successfully",
      data: result,
    });

  } catch (error) {
    console.error('Error in submitTest:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkTestAttempt = async (req, res, next) => {
  try {
    const { studentId, testId } = req.body;
    const existing = await Result.findOne({ studentId, testId })

    return res.status(200).json({
      attempted: !!existing,
      success: true,
      data: existing
    })

  } catch (error) {
    next(error)
  }
}

export const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required"
      });
    }

    const results = await Result.find({ studentId }).populate('testId').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Student results fetched successfully",
      data: results
    });

  } catch (error) {
    console.error('Error in getStudentResults:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate("studentId", "fullName email")
      .populate("testId", "title");

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};