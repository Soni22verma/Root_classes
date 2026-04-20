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

    // ✅ CHANGE: Check if already attempted (completed)
    const alreadyAttempted = await Result.findOne({ studentId, testId });
    if (alreadyAttempted) {
      return res.status(400).json({
        success: false,
        message: "You have already completed this test. You cannot retake it.",
      });
    }
cd
    let obtainedMarks = 0;
    let totalMarks = 0;
    const formattedAnswers = [];

    // Calculate scores
    test.questions.forEach((q) => {
      totalMarks += q.marks;
      
      const questionIdStr = q._id.toString();
      const userAnswer = answers[questionIdStr];
      
      const isCorrect = Number(userAnswer) === Number(q.correctAnswer);
      
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

export const checkTestAttempt = async(req,res,next)=>{
  try {
    const{studentId,testId} = req.body;
    const existing = await Result.findOne({studentId, testId})

    return res.status(200).json({
      attempted: !!existing,
    })
    
  } catch (error) {
    next(error)
  }
}