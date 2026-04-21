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
      setStudentId(student._id);
      setIsLoggedIn(true);
    } else if (student && student.id) {
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
          } else {
            setIsLoggedIn(false);
            setStudentId(null);
          }
        } else {
          setIsLoggedIn(false);
          setStudentId(null);
        }
      } catch (error) {
        setIsLoggedIn(false);
        setStudentId(null);
      }
    }
  }, [student]);

  const fetchCompletedTests = async () => {
    if (!studentId) return [];
    try {
      const res = await axios.post(api.result.getStudentResults, { studentId });
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
    if (!studentId) return { attempted: false, result: null };
    try {
      const res = await axios.post(api.result.attemptTest, { studentId, testId });
      if (res.data && res.data.success) {
        if (res.data.data && (res.data.data.attempted === true || res.data.data.alreadyAttempted === true)) {
          return { attempted: true, result: res.data.data };
        }
        if (res.data.message && (res.data.message.includes('already') || res.data.message.includes('completed'))) {
          return { attempted: true, result: res.data.data };
        }
        return { attempted: false, result: null };
      }
      return { attempted: false, result: null };
    } catch (error) {
      if (error.response && error.response.data) {
        const message = error.response.data.message || '';
        if (message.includes('already') || message.includes('completed') || message.includes('attempted')) {
          return { attempted: true, result: error.response.data.data || null };
        }
      }
      return { attempted: false, result: null };
    }
  };

  const GetAllPublishedTest = async () => {
    try {
      setLoading(true);
      const res = await axios.post(api.test.publishTest);
      if (res.data && res.data.success && res.data.data) {
        const completed = await fetchCompletedTests();
        const completedTestIds = new Set(completed.map(t => t.testId));
        const completedResultsMap = new Map();
        completed.forEach(result => completedResultsMap.set(result.testId, result));

        const testsWithAttemptStatus = await Promise.all(
          res.data.data.map(async (test) => {
            let isCompleted = completedTestIds.has(test._id);
            let completedResult = completedResultsMap.get(test._id);
            if (!isCompleted) {
              try {
                const attemptStatus = await checkAttemptTest(test._id);
                isCompleted = attemptStatus.attempted;
                completedResult = completedResult || attemptStatus.result;
              } catch (error) { }
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
              isCompleted,
              completedResult,
              originalData: test
            };
          })
        );
        setAvailableTests(testsWithAttemptStatus);
      } else {
        setAvailableTests([]);
      }
    } catch (error) {
      setAvailableTests([]);
    } finally {
      setLoading(false);
    }
  };

  const SubmitTest = async (testId, answers) => {
    try {
      setSubmitting(true);
      const requestData = { studentId, testId, answers };
      const res = await axios.post(api.result.submitTest, requestData);
      if (res.data?.success) {
        setScoreDetails(res.data.data);
        await GetAllPublishedTest();
        await fetchCompletedTests();
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data?.message || "Submission failed" };
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit test. Please try again.");
      return { success: false, error: error.message };
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTestQuestions = async (testId) => {
    try {
      const res = await axios.post(api.test.getQuestion, { testId });
      if (res.data && res.data.success && res.data.data) {
        let questionsData = [];
        if (Array.isArray(res.data.data)) {
          questionsData = res.data.data;
        } else if (res.data.data.questions && Array.isArray(res.data.data.questions)) {
          questionsData = res.data.data.questions;
        } else if (res.data.data.question) {
          questionsData = [res.data.data];
        }
        return questionsData.map((q) => ({
          _id: q._id,
          id: q._id,
          questionId: q._id,
          text: q.question || q.questionText || q.text || "Question not available",
          options: q.options || ["Option 1", "Option 2", "Option 3", "Option 4"],
          marks: q.marks || 1,
          correctAnswer: q.correctAnswer !== undefined ? parseInt(q.correctAnswer) : 0
        }));
      }
    } catch (error) { }
    return [];
  };

  const handleStartTest = async (test) => {
    if (test.isCompleted) {
      alert('You have already completed this test. You cannot retake it.');
      return;
    }
    let currentStudentId = studentId;
    if (!currentStudentId && student) {
      currentStudentId = student._id || student.id;
      if (currentStudentId) { setStudentId(currentStudentId); setIsLoggedIn(true); }
    }
    if (!currentStudentId) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          currentStudentId = user._id || user.id || user.userId || user.studentId;
          if (currentStudentId) { setStudentId(currentStudentId); setIsLoggedIn(true); }
        }
      } catch (error) { }
    }
    if (!currentStudentId) { alert('Please login to take the test'); return; }

    setCheckingAttempt(true);
    const attemptStatus = await checkAttemptTest(test.id);
    if (attemptStatus.attempted) {
      alert('You have already completed this test. You cannot retake it.');
      await GetAllPublishedTest();
      setCheckingAttempt(false);
      return;
    }
    setCheckingAttempt(false);
    setSelectedTest(test);
    setLoading(true);
    const testQuestions = await fetchTestQuestions(test.id);
    setQuestions(testQuestions);
    if (test.duration) { setTimeRemaining(test.duration * 60); setTimerActive(true); }
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
            if (!testCompleted) calculateAndSubmitScore();
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
    questions.forEach(question => {
      const questionId = question._id || question.id || question.questionId;
      const userAnswer = answers[questionId];
      if (userAnswer !== undefined && userAnswer !== null) {
        formattedAnswers[questionId] = Number(userAnswer);
      }
    });
    if (Object.keys(formattedAnswers).length === 0) {
      alert("Please answer at least one question before submitting.");
      return;
    }
    const result = await SubmitTest(selectedTest.id, formattedAnswers);
    if (result.success) {
      setTestCompleted(true);
      setTimerActive(false);
      if (result.data) { setScoreDetails(result.data); setScore(result.data.percentage); }
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
    else calculateAndSubmitScore();
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleBackToTests = () => {
    if (testStarted && !testCompleted) {
      if (!window.confirm('Are you sure you want to exit? Your progress will be lost.')) return;
    }
    setTestStarted(false); setSelectedTest(null); setTestCompleted(false);
    setCurrentQuestion(0); setAnswers({}); setScore(null); setScoreDetails(null);
    setQuestions([]); setTimerActive(false); setTimeRemaining(null);
  };

  const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return 'bg-gray-100 text-gray-600';
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-50 text-green-700 border border-green-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'hard': return 'bg-red-50 text-[#FB0500] border border-red-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getProgressPercentage = () => {
    const answeredCount = Object.keys(answers).length;
    return questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  };

  useEffect(() => { GetAllPublishedTest(); }, [studentId]);
  useEffect(() => { if (testCompleted && studentId) { GetAllPublishedTest(); fetchCompletedTests(); } }, [testCompleted]);

  // ── Loading / Checking Screens ──────────────────────────────────────────────
  if (loading && !testStarted) {
    return (
      <div className="min-h-screen bg-dot-grid flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-[#0078FF] rounded-full animate-spin mx-auto mb-4" style={{ borderWidth: 3 }}></div>
          <p className="text-sm text-gray-500">Loading available tests...</p>
        </div>
      </div>
    );
  }

  if (checkingAttempt) {
    return (
      <div className="min-h-screen bg-dot-grid flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-[#FB0500] rounded-full animate-spin mx-auto mb-4" style={{ borderWidth: 3 }}></div>
          <p className="text-sm text-gray-500">Checking test availability...</p>
        </div>
      </div>
    );
  }

  // ── Test List View ───────────────────────────────────────────────────────────
  if (!testStarted && !testCompleted) {
    const totalDuration = availableTests.reduce((sum, t) => sum + (t.duration || 0), 0);
    const totalQuestions = availableTests.reduce((sum, t) => sum + (t.totalQuestions || 0), 0);
    const completedCount = availableTests.filter(t => t.isCompleted).length;

    return (
      <div className="bg-white min-h-screen">

        {/* ── Hero (Light & Sleek) ── */}
        <div className="relative bg-white border-b border-gray-100 overflow-hidden">
          {/* Dot pattern matching StatsBar */}
          <div className="absolute inset-0 opacity-[0.4]" style={{
            backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />

          {/* Subtle color glows */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0078FF]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FB0500]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0078FF]"></span>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Assessment Hub</p>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                  Available <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB0500] via-[#0078FF] to-[#28A745]">Tests</span>
                </h1>
              </div>

              {/* Login status - Compact */}
              <div className="flex-shrink-0">
                {!isLoggedIn ? (
                  <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-2">
                    <p className="text-yellow-700 text-xs font-semibold uppercase tracking-wider">Login to attempt</p>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2">
                    <span className="text-green-600 text-sm font-bold">✓</span>
                    <p className="text-green-700 text-xs font-semibold uppercase tracking-wider">Ready to Test</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-white border-b border-gray-100 shadow-sm relative z-20">
          <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 divide-x-0 md:divide-x divide-gray-100">
            {[
              { label: 'Total Tests', value: availableTests.length, color: '#FB0500' },
              { label: 'Total Questions', value: totalQuestions, color: '#0078FF' },
              { label: 'Total Duration', value: `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`, color: '#28A745' },
              { label: 'Completed', value: completedCount, color: '#F1C40F' },
            ].map((s, i) => (
              <div key={i} className="text-center py-2 px-4 transition-transform hover:scale-105">
                <div className="text-2xl md:text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Grid */}
        <div className="bg-line-grid py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {availableTests.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No tests available at the moment. Check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {availableTests.map((test, i) => {
                  const isDark = i % 7 === 2;
                  const isWide = i % 5 === 0;
                  const accentRed = i % 2 === 0;

                  return (
                    <div
                      key={test.id}
                      className={`rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col ${isWide ? 'md:col-span-7' : 'md:col-span-5'
                        } ${isDark
                          ? 'bg-[#0a1628] border-[#1e3a5f]'
                          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
                        } ${test.isCompleted ? 'opacity-80' : ''}`}
                    >
                      {/* Card top bar */}
                      <div className={`h-1.5 w-full ${accentRed ? 'bg-[#FB0500]' : 'bg-[#0078FF]'}`}></div>

                      <div className="p-6 flex flex-col flex-1">
                        {/* Header row */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${getDifficultyColor(test.difficulty)}`}>
                              {test.difficulty}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded-lg ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
                              {test.category}
                            </span>
                          </div>
                          {test.isCompleted && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 flex-shrink-0">
                              ✓ Done
                            </span>
                          )}
                        </div>

                        <h3 className={`text-lg font-bold mb-2 leading-snug ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {test.title}
                        </h3>
                        <p className={`text-sm mb-5 line-clamp-2 leading-relaxed flex-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {test.description}
                        </p>

                        {/* Meta row */}
                        <div className={`grid grid-cols-2 gap-2 mb-5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {test.duration} min
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                            </svg>
                            {test.totalQuestions} Qs
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            {test.totalMarks} Marks
                          </div>
                          {test.isCompleted && test.completedResult && (
                            <div className="flex items-center gap-1.5 text-green-600 font-semibold">
                              Score: {test.completedResult.percentage || 0}%
                            </div>
                          )}
                        </div>

                        {/* Action */}
                        {test.isCompleted ? (
                          <button
                            onClick={() => handleViewResult(test)}
                            className="w-full py-2.5 rounded-xl font-semibold text-sm border-2 border-green-500 text-green-600 hover:bg-green-50 transition"
                          >
                            View Result →
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartTest(test)}
                            disabled={!isLoggedIn}
                            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${isLoggedIn
                                ? accentRed
                                  ? 'bg-[#FB0500] text-white hover:opacity-90'
                                  : 'bg-[#0078FF] text-white hover:opacity-90'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                          >
                            {isLoggedIn ? 'Start Test →' : 'Login to Start'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Result Modal */}
        {showResultModal && viewingResult && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowResultModal(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="bg-[#0a1628] p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-1">Result</p>
                    <h2 className="text-xl font-bold text-white">Test Completed</h2>
                    <p className="text-gray-400 text-sm mt-0.5">{viewingResult.testTitle}</p>
                  </div>
                  <button onClick={() => setShowResultModal(false)} className="text-gray-400 hover:text-white transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="text-5xl font-bold text-[#FB0500] mb-1">
                  {viewingResult.percentage || viewingResult.score || 0}%
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  {(viewingResult.percentage || 0) >= 70 ? 'Great job! You passed.' : 'Keep practicing to improve.'}
                </p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-5 text-sm text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Obtained Marks</span>
                    <span className="font-semibold text-gray-800">{viewingResult.obtainedMarks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Marks</span>
                    <span className="font-semibold text-gray-800">{viewingResult.totalMarks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completed On</span>
                    <span className="font-semibold text-gray-800">
                      {viewingResult.completedAt ? new Date(viewingResult.completedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {viewingResult.isEligible && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-green-600 text-xs font-semibold">✓ Eligible for certification</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowResultModal(false)}
                  className="w-full py-2.5 bg-[#0078FF] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition"
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

  // ── Test Taking View ─────────────────────────────────────────────────────────
  if (testStarted && !testCompleted) {
    if (loading) {
      return (
        <div className="min-h-screen bg-dot-grid flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-3 border-gray-200 border-t-[#0078FF] animate-spin mx-auto mb-4" style={{ borderWidth: 3 }}></div>
            <p className="text-sm text-gray-500">Loading test questions...</p>
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
        <div className="min-h-screen bg-dot-grid flex items-center justify-center p-4">
          <div className="text-center max-w-sm bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#FB0500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold mb-1">No Questions Found</p>
            <p className="text-sm text-gray-400 mb-5">This test has no questions available.</p>
            <button onClick={handleBackToTests} className="px-5 py-2 bg-[#0078FF] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition">
              Back to Tests
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Sticky header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-bold text-gray-900 text-sm">{selectedTest.title}</p>
                <p className="text-xs text-gray-400">Question {currentQuestion + 1} of {questions.length}</p>
              </div>
              <div className="flex items-center gap-3">
                {timeRemaining !== null && (
                  <div className={`px-3 py-1.5 rounded-lg font-mono font-bold text-sm tabular-nums ${timeRemaining < 300 ? 'bg-red-50 text-[#FB0500] border border-red-200' : 'bg-blue-50 text-[#0078FF] border border-blue-100'
                    }`}>
                    {formatTime(timeRemaining)}
                  </div>
                )}
                <button onClick={handleBackToTests} className="text-xs text-gray-400 hover:text-gray-700 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
                  ✕ Exit
                </button>
              </div>
            </div>
            {/* Progress bars */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Navigation</span><span>{currentQuestion + 1}/{questions.length}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0078FF] rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Answered</span><span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#08B100] rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Question panel */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-xs font-bold text-[#0078FF] bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg">
                    Q{currentQuestion + 1}
                  </span>
                  <span className="text-xs text-gray-400">{currentQ.marks} mark{currentQ.marks > 1 ? 's' : ''}</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-6 leading-relaxed">
                  {currentQ?.text}
                </h3>

                <div className="space-y-2.5">
                  {currentQ?.options.map((option, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start p-3.5 border-2 rounded-xl cursor-pointer transition-all ${answers[currentQ.id] === idx
                          ? 'border-[#0078FF] bg-blue-50'
                          : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                        }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQ.id}`}
                        value={idx}
                        checked={answers[currentQ.id] === idx}
                        onChange={() => handleAnswerSelect(currentQ.id, idx)}
                        className="w-4 h-4 text-[#0078FF] focus:ring-[#0078FF] mt-0.5 accent-[#0078FF]"
                      />
                      <span className="ml-3 text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between gap-3 mt-7">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition ${currentQuestion === 0 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={!hasAnswered || submitting}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition ${!hasAnswered || submitting
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-[#FB0500] text-white hover:opacity-90'
                      }`}
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (isLastQuestion ? '✓ Submit Test' : 'Next →')}
                  </button>
                </div>
              </div>
            </div>

            {/* Question palette sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-28">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Question Palette</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {questions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`w-9 h-9 rounded-lg font-semibold text-xs transition ${currentQuestion === idx
                          ? 'bg-[#0078FF] text-white shadow-sm'
                          : answers[q.id] !== undefined
                            ? 'bg-[#08B100] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#08B100]"></div>Answered</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#0078FF]"></div>Current</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-200"></div>Not Answered</div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                  {Object.keys(answers).length} of {questions.length} answered
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Results View ─────────────────────────────────────────────────────────────
  if (testCompleted) {
    const percentage = Math.round(score || scoreDetails?.percentage || 0);
    const obtainedMarks = scoreDetails?.obtainedMarks || 0;
    const totalPossibleMarks = scoreDetails?.totalMarks || questions.reduce((sum, q) => sum + q.marks, 0);
    const eligibilityStatus = scoreDetails?.isEligible;

    let resultLabel = '';
    let resultAccent = '';
    if (percentage >= 80) { resultLabel = 'Excellent!'; resultAccent = 'text-[#08B100]'; }
    else if (percentage >= 60) { resultLabel = 'Good Job!'; resultAccent = 'text-[#0078FF]'; }
    else if (percentage >= 40) { resultLabel = 'Keep Practicing!'; resultAccent = 'text-yellow-500'; }
    else { resultLabel = 'Need Improvement'; resultAccent = 'text-[#FB0500]'; }

    return (
      <div className="min-h-screen bg-dot-grid flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#0a1628] px-8 py-7 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-1">Test Complete</p>
            <h2 className="text-xl font-bold text-white">{selectedTest.title}</h2>
          </div>

          <div className="p-8 text-center">
            {/* Score */}
            <div className={`text-6xl font-bold mb-1 ${resultAccent}`}>{percentage}%</div>
            <p className={`text-base font-semibold mb-6 ${resultAccent}`}>{resultLabel}</p>

            {eligibilityStatus !== undefined && (
              <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${eligibilityStatus ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                {eligibilityStatus ? '✓ You are eligible for certification.' : 'Score 70%+ to become eligible for certification.'}
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-7">
              {[
                { label: 'Total Questions', value: questions.length, color: 'text-[#0078FF]' },
                { label: 'Attempted', value: Object.keys(answers).length, color: 'text-[#FB0500]' },
                { label: 'Score Obtained', value: obtainedMarks, color: 'text-[#08B100]' },
                { label: 'Total Marks', value: totalPossibleMarks, color: 'text-gray-700' },
              ].map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <button
              onClick={handleBackToTests}
              className="w-full py-3 bg-[#0078FF] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition"
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
