import axios from 'axios';
import React, { useEffect, useState } from 'react';
import api from '../../services/endpoints';
import useStudentStore from '../../Store/studentstore';

const StudentTestPanel = () => {
  const { student } = useStudentStore();
  
  const [availableTests, setAvailableTests] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [scoreDetails, setScoreDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewingResult, setViewingResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [checkingAttempt, setCheckingAttempt] = useState(false);

  useEffect(() => {
    if (student && student._id) {
      console.log('Student found in store:', student);
      setStudentId(student._id);
      setIsLoggedIn(true);
    } else if (student && student.id) {
      console.log('Student found with id:', student);
      setStudentId(student.id);
      setIsLoggedIn(true);
    } else {
      try {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          const id = user._id || user.id || user.userId || user.studentId;
          if (id) {
            setStudentId(id);
            setIsLoggedIn(true);
            console.log('Student ID from localStorage fallback:', id);
          } else {
            setIsLoggedIn(false);
            setStudentId(null);
          }
        } else {
          setIsLoggedIn(false);
          setStudentId(null);
        }
      } catch (error) {
        console.error('Error checking localStorage:', error);
        setIsLoggedIn(false);
        setStudentId(null);
      }
    }
  }, [student]);

  const fetchCompletedTests = async () => {
    if (!studentId) return [];
    
    try {
      const res = await axios.post(api.result.getStudentResults, {
        studentId: studentId
      });
      
      console.log('Completed tests response:', res);
      
      if (res.data && res.data.success && res.data.data) {
        const completed = res.data.data.map(result => ({
          testId: result.testId?._id || result.testId,
          testTitle: result.testId?.title || 'Unknown Test',
          score: result.obtainedMarks,
          totalMarks: result.totalMarks,
          percentage: result.percentage,
          completedAt: result.createdAt,
          isEligible: result.isEligible,
          obtainedMarks: result.obtainedMarks,
          totalQuestions: result.totalQuestions
        }));
        
        setCompletedTests(completed);
        return completed;
      }
    } catch (error) {
      console.error('Error fetching completed tests:', error);
    }
    
    return [];
  };

  const checkAttemptTest = async (testId) => {
    if (!studentId) {
      console.log('No student ID found');
      return { attempted: false, result: null };
    }
    
    try {
      console.log('Checking attempt for test:', testId, 'Student:', studentId);
      const res = await axios.post(api.result.attemptTest, {
        studentId: studentId,
        testId: testId,
      });
      console.log('Attempt check response:', res);
      
      if (res.data && res.data.success) {
        // Check if the response indicates test is already attempted
        if (res.data.data && (res.data.data.attempted === true || res.data.data.alreadyAttempted === true)) {
          return {
            attempted: true,
            result: res.data.data
          };
        }
        // Check if message indicates already attempted
        if (res.data.message && (res.data.message.includes('already') || res.data.message.includes('completed'))) {
          return {
            attempted: true,
            result: res.data.data
          };
        }
        return { attempted: false, result: null };
      }
      return { attempted: false, result: null };
    } catch (error) {
      console.log('Error checking attempt:', error);
      // If the API returns an error with message about already completed
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        const message = responseData.message || '';
        
        if (message.includes('already') || message.includes('completed') || message.includes('attempted')) {
          console.log('Test already attempted according to error message');
          return { 
            attempted: true, 
            result: responseData.data || null 
          };
        }
      }
      return { attempted: false, result: null };
    }
  };

  const GetAllPublishedTest = async () => {
    try {
      setLoading(true);
      const res = await axios.post(api.test.publishTest);
      console.log('API Response:', res);
      
      if (res.data && res.data.success && res.data.data) {
        // First, get completed tests from results API
        const completed = await fetchCompletedTests();
        const completedTestIds = new Set(completed.map(t => t.testId));
        
        // Check attempt status for each test
        const testsWithAttemptStatus = await Promise.all(
          res.data.data.map(async (test) => {
            // Check if test is in completed tests list
            let isCompleted = completedTestIds.has(test._id);
            let completedResult = completed.find(t => t.testId === test._id);
            
            // If not in completed list, check attempt status via API
            if (!isCompleted) {
              const attemptStatus = await checkAttemptTest(test._id);
              isCompleted = attemptStatus.attempted;
              completedResult = completedResult || attemptStatus.result;
              console.log(`Test ${test.title} (${test._id}) - Attempted: ${attemptStatus.attempted}`);
            }
            
            return {
              id: test._id,
              title: test.title || "Untitled Test",
              duration: test.duration || 30,
              totalQuestions: test.totalQuestions || 0,
              totalMarks: test.totalMarks || 0,
              description: test.description || `Test your knowledge in ${test.title}`,
              difficulty: test.difficulty || "Medium",
              category: test.category || "General",
              isCompleted: isCompleted, // This will disable the card/button
              completedResult: completedResult,
              originalData: test
            };
          })
        );
        
        console.log('Tests with completion status:', testsWithAttemptStatus);
        setAvailableTests(testsWithAttemptStatus);
      } else {
        console.error('Unexpected API response format:', res.data);
        setAvailableTests([]);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      setAvailableTests([]);
    } finally {
      setLoading(false);
    }
  };

  const SubmitTest = async (testId, answers) => {
    try {
      setSubmitting(true);

      const requestData = {
        studentId,
        testId,
        answers 
      };

      console.log('Submitting test - Full request:', JSON.stringify(requestData, null, 2));
      console.log("Answers being submitted:", answers);
      console.log("Number of answers being submitted:", Object.keys(answers).length);
      
      const res = await axios.post(api.result.submitTest, requestData);

      console.log("Submit Response:", res.data);

      if (res.data?.success) {
        setScoreDetails(res.data.data);
        
        // Refresh both test lists after successful submission
        await GetAllPublishedTest();
        await fetchCompletedTests();
        
        return { success: true, data: res.data.data };
      }

      return { success: false, error: res.data?.message || "Submission failed" };

    } catch (error) {
      console.error("Submit Error Details:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to submit test. Please try again.");
      return { success: false, error: error.message };
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTestQuestions = async (testId) => {
    try {
      console.log(testId, "Fetching questions for test");
      const res = await axios.post(api.test.getQuestion, {
        testId: testId
      });
      console.log('Questions API Response:', res);
      
      if (res.data && res.data.success && res.data.data) {
        let questionsData = [];
        if (Array.isArray(res.data.data)) {
          questionsData = res.data.data;
        } else if (res.data.data.questions && Array.isArray(res.data.data.questions)) {
          questionsData = res.data.data.questions;
        } else if (res.data.data.question) {
          questionsData = [res.data.data];
        } else {
          questionsData = [];
        }

        const transformedQuestions = questionsData.map((q, idx) => ({
          _id: q._id,  
          id: q._id,   
          questionId: q._id,  
          text: q.question || q.questionText || q.text || "Question not available",
          options: q.options || ["Option 1", "Option 2", "Option 3", "Option 4"],
          marks: q.marks || 1,
          correctAnswer: q.correctAnswer !== undefined ? parseInt(q.correctAnswer) : 0
        }));
        
        console.log('Transformed questions:', transformedQuestions);
        return transformedQuestions;
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
    
    return [];
  };

  const handleStartTest = async (test) => {
    // First check if test is already marked as completed
    if (test.isCompleted) {
      alert('❌ You have already completed this test. You cannot retake it.');
      return;
    }
    
    let currentStudentId = studentId;
    
    if (!currentStudentId && student) {
      currentStudentId = student._id || student.id;
      if (currentStudentId) {
        setStudentId(currentStudentId);
        setIsLoggedIn(true);
      }
    }
    
    if (!currentStudentId) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          currentStudentId = user._id || user.id || user.userId || user.studentId;
          if (currentStudentId) {
            setStudentId(currentStudentId);
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
    
    if (!currentStudentId) {
      alert('Please login to take the test');
      return;
    }
    
    setCheckingAttempt(true);
    
    // Double check with API if test is already attempted
    const attemptStatus = await checkAttemptTest(test.id);
    
    if (attemptStatus.attempted) {
      alert('❌ You have already completed this test. You cannot retake it.');
      await GetAllPublishedTest(); // Refresh the list to update UI
      setCheckingAttempt(false);
      return;
    }
    
    setCheckingAttempt(false);
    
    // If we reach here, student hasn't taken the test yet
    setSelectedTest(test);
    setLoading(true);
    
    const testQuestions = await fetchTestQuestions(test.id);
    setQuestions(testQuestions);
    
    if (test.duration) {
      setTimeRemaining(test.duration * 60);
      setTimerActive(true);
    }
    
    setTestStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setTestCompleted(false);
    setScore(null);
    setScoreDetails(null);
    setLoading(false);
  };

  const handleViewResult = (test) => {
    setViewingResult(test.completedResult);
    setShowResultModal(true);
  };

  useEffect(() => {
    let interval;
    if (timerActive && timeRemaining > 0 && !testCompleted) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerActive(false);
            if (!testCompleted) {
              calculateAndSubmitScore();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, testCompleted]);

  const calculateAndSubmitScore = async () => {
    if (submitting || testCompleted) return;

    const formattedAnswers = {};

    console.log("Current answers state:", answers);
    console.log("Questions array:", questions);

    questions.forEach(question => {
      const questionId = question._id || question.id || question.questionId;
      
      const userAnswer = answers[questionId];
      
      if (userAnswer !== undefined && userAnswer !== null) {
        formattedAnswers[questionId] = Number(userAnswer);
      } else {
        console.log(`No answer for question: ${questionId}`);
      }
    });

    console.log("Formatted Answers to submit:", formattedAnswers);
    console.log("Number of answers:", Object.keys(formattedAnswers).length);

    if (Object.keys(formattedAnswers).length === 0) {
      console.warn("No answers to submit!");
      alert("Please answer at least one question before submitting.");
      return;
    }

    const result = await SubmitTest(selectedTest.id, formattedAnswers);

    if (result.success) {
      setTestCompleted(true);
      setTimerActive(false);

      if (result.data) {
        setScoreDetails(result.data);
        setScore(result.data.percentage);
      }
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    console.log(`Setting answer for question ${questionId} to ${answerIndex}`);
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: answerIndex
      };
      console.log("New answers state:", newAnswers);
      return newAnswers;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateAndSubmitScore();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleBackToTests = () => {
    if (testStarted && !testCompleted) {
      const confirmExit = window.confirm('Are you sure you want to exit? Your progress will be lost.');
      if (!confirmExit) return;
    }
    
    setTestStarted(false);
    setSelectedTest(null);
    setTestCompleted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setScore(null);
    setScoreDetails(null);
    setQuestions([]);
    setTimerActive(false);
    setTimeRemaining(null);
  };

  const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return 'bg-gray-100 text-gray-800';
    switch(difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = () => {
    const answeredCount = Object.keys(answers).length;
    return questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  };

  // Initial load when studentId is available
  useEffect(() => {
    if (studentId) {
      GetAllPublishedTest();
    }
  }, [studentId]);

  // Refresh test list when test is completed
  useEffect(() => {
    if (testCompleted && studentId) {
      GetAllPublishedTest();
      fetchCompletedTests();
    }
  }, [testCompleted]);

  if (loading && !testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading available tests...</p>
        </div>
      </div>
    );
  }

  if (checkingAttempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Checking test availability...</p>
        </div>
      </div>
    );
  }

  if (!testStarted && !testCompleted) {
    const totalDuration = availableTests.reduce((sum, test) => sum + (test.duration || 0), 0);
    const totalQuestions = availableTests.reduce((sum, test) => sum + (test.totalQuestions || 0), 0);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="bg-white/80 backdrop-blur-sm shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                📚 Available Assessments
              </h1>
              <p className="text-gray-600 text-lg">Choose a test to challenge yourself and track your progress</p>
              
              <div className="mt-2 text-xs text-gray-400">
                Status: {isLoggedIn ? 'Logged In' : 'Not Logged In'} | Student ID: {studentId || 'None'}
              </div>
              
              {!isLoggedIn && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg inline-block">
                  <p className="text-yellow-700">⚠️ Please login to take tests</p>
                </div>
              )}
              {isLoggedIn && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg inline-block">
                  <p className="text-green-700">✅ Welcome {student?.name || student?.fullName || 'Student'}! You are logged in and ready to take tests</p>
                </div>
              )}
              {availableTests.length === 0 && !loading && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg inline-block">
                  <p className="text-yellow-700">No tests available at the moment. Please check back later.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-md p-4 mb-8">
            <div className="flex justify-around items-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{availableTests.length}</div>
                <div className="text-sm text-gray-500">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalQuestions}</div>
                <div className="text-sm text-gray-500">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                </div>
                <div className="text-sm text-gray-500">Total Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{completedTests.length}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableTests.map((test) => (
              <div 
                key={test.id} 
                className={`group bg-white rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ${
                  test.isCompleted ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-2xl transform hover:-translate-y-1'
                }`}
              >
                <div className="relative">
                  <div className="absolute top-0 right-0 m-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(test.difficulty)}`}>
                      {test.difficulty}
                    </span>
                    {test.isCompleted && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Completed ✓
                      </span>
                    )}
                  </div>
                  <div className={`h-32 ${test.isCompleted ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {test.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    {test.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{test.duration} minutes</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        <span>{test.totalQuestions} Questions</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{test.totalMarks} Marks</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"></path>
                        </svg>
                        <span>{test.category}</span>
                      </div>
                    </div>
                  </div>

                  {test.isCompleted ? (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-100 rounded-xl p-3 text-center">
                        <p className="text-sm text-gray-600">Your Score</p>
                        <p className="text-xl font-bold text-green-600">
                          {test.completedResult?.percentage || test.completedResult?.score || 0}%
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewResult(test)}
                        className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-green-500 to-teal-600 text-white hover:shadow-lg"
                      >
                        View Result →
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartTest(test)}
                      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                        isLoggedIn 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg transform hover:scale-[1.02] cursor-pointer'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!isLoggedIn}
                    >
                      {isLoggedIn ? 'Start Test →' : 'Login to Start'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Result Modal */}
        {showResultModal && viewingResult && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-t-2xl p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">Test Result</h2>
                    <p className="text-green-100 mt-1">{selectedTest?.title || viewingResult.testTitle}</p>
                  </div>
                  <button
                    onClick={() => setShowResultModal(false)}
                    className="text-white/80 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">
                  {viewingResult.percentage || viewingResult.score || 0}%
                </div>
                <p className="text-gray-600 mb-6">
                  {(viewingResult.percentage || viewingResult.score || 0) >= 70 ? '🎉 Congratulations! You passed!' : '📚 Keep practicing to improve!'}
                </p>
                
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Obtained Marks:</span>
                    <span className="font-semibold text-gray-800">{viewingResult.obtainedMarks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Marks:</span>
                    <span className="font-semibold text-gray-800">{viewingResult.totalMarks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed On:</span>
                    <span className="font-semibold text-gray-800">
                      {viewingResult.completedAt ? new Date(viewingResult.completedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {viewingResult.isEligible && (
                    <div className="mt-2 p-2 bg-green-100 rounded-lg">
                      <span className="text-green-700 text-sm">🏆 You are eligible for certification!</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setShowResultModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Test Taking View
  if (testStarted && !testCompleted) {
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading test questions...</p>
          </div>
        </div>
      );
    }

    const currentQ = questions[currentQuestion];
    const isLastQuestion = currentQuestion === questions.length - 1;
    const hasAnswered = answers[currentQ?.id] !== undefined;
    const progress = getProgressPercentage();

    if (!currentQ || questions.length === 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 text-lg mb-4">No questions available for this test.</p>
            <button
              onClick={handleBackToTests}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Back to Tests
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white shadow-lg sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedTest.title}</h2>
                <p className="text-sm text-gray-500">Question {currentQuestion + 1} of {questions.length}</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {timeRemaining !== null && (
                  <div className={`px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${timeRemaining < 300 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'}`}>
                    <span className="text-xs mr-1">⏱️</span>
                    {formatTime(timeRemaining)}
                  </div>
                )}
                <button
                  onClick={handleBackToTests}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕ Exit
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Question Progress</span>
                <span>{currentQuestion + 1}/{questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Overall Completion</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  Q{currentQuestion + 1}
                </span>
                <span className="text-sm text-gray-500">{currentQ.marks} mark{currentQ.marks > 1 ? 's' : ''}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
                {currentQ?.text}
              </h3>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {currentQ?.options.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-start p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    answers[currentQ.id] === idx
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={idx}
                    checked={answers[currentQ.id] === idx}
                    onChange={() => handleAnswerSelect(currentQ.id, idx)}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 focus:ring-blue-500 mt-0.5"
                  />
                  <span className="ml-3 text-gray-700 text-sm sm:text-lg">{option}</span>
                </label>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 sm:mt-10">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold transition-all ${
                  currentQuestion === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                }`}
              >
                ← Previous
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={!hasAnswered || submitting}
                className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold transition-all ${
                  !hasAnswered || submitting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg transform hover:scale-[1.02]'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (isLastQuestion ? '✓ Submit Test' : 'Next →')}
              </button>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl shadow-md p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Question Palette</p>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold transition-all text-sm ${
                    currentQuestion === idx
                      ? 'bg-blue-500 text-white shadow-lg scale-110'
                      : answers[q.id] !== undefined
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-xs">
              <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded mr-1"></div><span>Answered</span></div>
              <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded mr-1"></div><span>Current</span></div>
              <div className="flex items-center"><div className="w-3 h-3 bg-gray-200 rounded mr-1"></div><span>Not Answered</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results View
  if (testCompleted) {
    const percentage = Math.round(score || scoreDetails?.percentage || 0);
    let resultMessage = "";
    let resultColor = "";
    
    if (percentage >= 80) {
      resultMessage = "Excellent! 🎉";
      resultColor = "text-green-600";
    } else if (percentage >= 60) {
      resultMessage = "Good Job! 👍";
      resultColor = "text-blue-600";
    } else if (percentage >= 40) {
      resultMessage = "Keep Practicing! 📚";
      resultColor = "text-yellow-600";
    } else {
      resultMessage = "Need Improvement 💪";
      resultColor = "text-red-600";
    }

    const eligibilityStatus = scoreDetails?.isEligible;
    const obtainedMarks = scoreDetails?.obtainedMarks || 0;
    const totalPossibleMarks = scoreDetails?.totalMarks || questions.reduce((sum, q) => sum + q.marks, 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-center transform transition-all">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mb-4 shadow-lg">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Test Completed!</h2>
            <p className="text-gray-600 text-sm sm:text-base">You've successfully completed {selectedTest.title}</p>
          </div>

          <div className={`text-5xl sm:text-6xl font-bold mb-2 ${resultColor}`}>
            {percentage}%
          </div>
          <p className={`text-lg sm:text-xl font-semibold mb-6 ${resultColor}`}>
            {resultMessage}
          </p>

          {eligibilityStatus !== undefined && (
            <div className={`mb-6 p-3 rounded-lg ${eligibilityStatus ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {eligibilityStatus ? '🎉 Congratulations! You are eligible for certification.' : '📚 Keep practicing to become eligible for certification (70% required)'}
            </div>
          )}

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{questions.length}</div>
                <div className="text-xs sm:text-sm text-gray-500">Total Questions</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">{Object.keys(answers).length}</div>
                <div className="text-xs sm:text-sm text-gray-500">Attempted</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-yellow-600">{obtainedMarks}</div>
                <div className="text-xs sm:text-sm text-gray-500">Score Obtained</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{totalPossibleMarks}</div>
                <div className="text-xs sm:text-sm text-gray-500">Total Marks</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleBackToTests}
              className="px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Take Another Test
            </button>
            
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StudentTestPanel;