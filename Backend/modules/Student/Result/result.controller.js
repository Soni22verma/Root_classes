import { Test } from "../models/test.model.js";
import { Result } from "../models/result.model.js";

export const submitTest = async (req, res) => {
  try {
    const { studentId, testId, answers } = req.body;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        message: "Test not found",
      });
    }

    const alreadyAttempted = await Result.findOne({ studentId, testId });

    if (alreadyAttempted) {
      return res.status(400).json({
        message: "You already attempted this test",
      });
    }

    let obtainedMarks = 0;
    let totalMarks = 0;

    const formattedAnswers = [];

    test.questions.forEach((q) => {
      totalMarks += q.marks;

      const userAnswer = answers[q._id.toString()];

      const isCorrect = Number(userAnswer) === Number(q.correctAnswer);

      if (isCorrect) {
        obtainedMarks += q.marks;
      }

      formattedAnswers.push({
        questionId: q._id,
        selectedAnswer: userAnswer,
        isCorrect: isCorrect,
      });
    });

    const percentage = (obtainedMarks / totalMarks) * 100;

    const isEligible = percentage >= 70;

    const result = await Result.create({
      studentId,
      testId,
      obtainedMarks,
      totalMarks,
      percentage,
      isEligible,
      answers: formattedAnswers,
    });

    res.status(200).json({
      success: true,
      message: "Test submitted successfully",
      data: result,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};