import { Test } from "./createtest.model.js";

export const createTest = async (req, res) => {
  try {
    const { title, duration, passingPercentage } = req.body;

    const test = await Test.create({
      title,
      duration,
      passingPercentage
    });

    res.json({
      success: true,
      message: "Test created successfully",
      data: test
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateTest = async (req, res) => {
  try {
    const { testId, title, duration, passingPercentage, isPublished } = req.body;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    if (title) test.title = title;
    if (duration) test.duration = duration;
    if (passingPercentage) test.passingPercentage = passingPercentage;

    if (typeof isPublished === "boolean") {
      test.isPublished = isPublished;
    }

    await test.save();

    res.json({
      success: true,
      message: "Test updated successfully",
      data: test
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const DeleteTest = async(req,res,next)=>{
  try {
    const {testId} = req.body;
    if(!testId){
      return res.status(400).json({
        message:'testId is required',
        error:true,
        success:false
      })
    }

    const deletedTest = await Test.findByIdAndDelete(testId)
    return res.status(200).json({
      message:"test Deleted Successfully",
      error:false,
      success:true,
      data:deletedTest
    })

    
  } catch (error) {
    console.log(error)
  }
}


export const addQuestion = async (req, res) => {
  try {
    const { testId,question, options, correctAnswer, marks } = req.body;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    test.questions.push({
      question,
      options,
      correctAnswer,
      marks
    });

    test.totalMarks += marks || 1;

    await test.save();

    res.json({
      success: true,
      message: "Question added",
      data: test
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getQuestionsByTest = async (req, res) => {
  try {

    const test = await Test.find().select("title questions");

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.json({
      success: true,
      data: test
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { testId, questionId,question, options, correctAnswer, marks } = req.body;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const ques = test.questions.id(questionId);

    if (!ques) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question) ques.question = question;
    if (options) ques.options = options;
    if (correctAnswer) ques.correctAnswer = correctAnswer;

    if (marks !== undefined) {
      test.totalMarks = test.totalMarks - ques.marks + marks;
      ques.marks = marks;
    }

    await test.save();

    res.json({
      success: true,
      message: "Question updated",
      data: test
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { testId, questionId } = req.body;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const ques = test.questions.id(questionId);

    if (!ques) {
      return res.status(404).json({ message: "Question not found" });
    }

    test.totalMarks -= ques.marks;

    ques.deleteOne();

    await test.save();

    res.json({
      success: true,
      message: "Question deleted",
      data: test
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const publishTest = async (req, res) => {
  try {
    const { testId } = req.body;

    const test = await Test.findByIdAndUpdate(
      testId,
      { isPublished: true },
      { new: true }
    );

    res.json({
      success: true,
      message: "Test published",
      data: test
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPublishedTests = async (req, res) => {
  try {
    const tests = await Test.find({ isPublished: true })
      .select("title duration totalMarks questions");

    const formattedTests = tests.map(test => ({
      _id: test._id,
      title: test.title,
      duration: test.duration,
      totalMarks: test.totalMarks,
      totalQuestions: test.questions.length  
    }));

    res.json({
      success: true,
      data: formattedTests
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getTestQuestionsForStudent = async (req, res) => {
  try {
    const { testId } = req.body;

    const test = await Test.findById(testId).select("title duration questions");

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const safeQuestions = test.questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      marks: q.marks
    }));

    res.json({
      success: true,
      data: {
        title: test.title,
        duration: test.duration,
        questions: safeQuestions
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};