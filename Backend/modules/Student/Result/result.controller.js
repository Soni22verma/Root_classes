import { Test } from "../../Admin/CreateTest/createtest.model.js";
import { Result } from "./result.model.js";

export const submitTest = async (req, res) => {
  try {
    const { studentId, testId, answers } = req.body;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const already = await Result.findOne({ studentId, testId });

    if (already) {
      return res.status(400).json({
        message: "You already attempted this test",
      });
    }

    let score = 0;
    let totalMarks = 0;

    test.questions.forEach((q) => {
      totalMarks += q.marks;

      if (answers[q._id] === q.correctAnswer) {
        score += q.marks;
      }
    });

    const percentage = (score / totalMarks) * 100;

    const isEligible = percentage >= 70;

    const result = await Result.create({
      studentId,
      testId,
      score,
      totalMarks,
      percentage,
      isEligible,
      answers,
    });

    res.json({
      success: true,
      message: "Test submitted successfully",
      data: result,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};