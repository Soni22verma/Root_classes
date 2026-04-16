// CourseDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useStudentStore from '../../../Store/studentstore';
import api from '../../../services/endpoints';

// Add Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CourseDetails = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { student } = useStudentStore();
  const studentId = student?._id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedChapters, setExpandedChapters] = useState({});
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showEnrollmentMessage, setShowEnrollmentMessage] = useState({ show: false, message: '', type: '' });
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    if (location.state?.course) {
      setCourse(location.state.course);
      setLoading(false);
      return;
    }

    if (courseId) {
      fetchCourseById();
    }
  }, [courseId, location.state]);

  // Check if student is already enrolled when component loads
  useEffect(() => {
    if (studentId && course?._id) {
      checkEnrollmentStatus();
    }
  }, [studentId, course]);

  const fetchCourseById = async () => {
    try {
      setLoading(true);
      let courseData = null;
      
      const res = await axios.get(api.fullcourse.getfullcourse);
      let coursesData = [];
      
      if (res.data?.success && res.data?.data?.data) {
        coursesData = res.data.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        coursesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        coursesData = res.data;
      }
      
      courseData = coursesData.find(c => c._id === courseId);
      
      if (courseData) {
        setCourse(courseData);
        const initialExpanded = {};
        courseData.modules?.forEach((_, idx) => {
          initialExpanded[idx] = false;
        });
        setExpandedModules(initialExpanded);
      } else {
        setError('Course not found');
      }
    } catch (err) {
      console.error("Error fetching course:", err);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const res = await axios.get(`${api.student.getStudentProfile}/${studentId}`);
      if (res.data?.success && res.data?.data) {
        const studentData = res.data.data;
        if (studentData.enrolledCourses && studentData.enrolledCourses.includes(courseId)) {
          setIsEnrolled(true);
        }
      }
    } catch (error) {
      console.error("Error checking enrollment status:", error);
    }
  };

  const createRazorpayPayment = async () => {
    try {
      const response = await axios.post(api.payment.createPayment, {
        amount: course.price || 0,
        currency: 'INR',
        studentId: studentId,
        courseId: courseId,
        courseName: course.title
      });

      if (response.data.success) {
        return response.data.order;
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const response = await axios.post(api.payment.verifyPayment, paymentData);
      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  };

  const handleEnrollWithPayment = async () => {
    if (!studentId) {
      setShowEnrollmentMessage({
        show: true,
        message: "Please login to enroll in this course",
        type: 'error'
      });
      setTimeout(() => setShowEnrollmentMessage({ show: false, message: '', type: '' }), 3000);
      return;
    }

    if (course.price === 0 || !course.price) {
      await enrollForFree();
      return;
    }

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setShowEnrollmentMessage({
        show: true,
        message: "Failed to load payment gateway. Please try again.",
        type: 'error'
      });
      setTimeout(() => setShowEnrollmentMessage({ show: false, message: '', type: '' }), 3000);
      return;
    }

    setPaymentProcessing(true);

    try {
      const order = await createRazorpayPayment();
      
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: course.title,
        description: `Enrollment for ${course.title}`,
        order_id: order.id,
        handler: async (response) => {
          const paymentVerification = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            studentId: studentId,
            courseId: courseId
          });

          if (paymentVerification.success) {
            await completeEnrollment();
          } else {
            setShowEnrollmentMessage({
              show: true,
              message: "Payment verification failed. Please contact support.",
              type: 'error'
            });
            setTimeout(() => setShowEnrollmentMessage({ show: false, message: '', type: '' }), 3000);
          }
        },
        prefill: {
          name: student?.name || '',
          email: student?.email || '',
          contact: student?.phone || ''
        },
        notes: {
          studentId: studentId,
          courseId: courseId
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
            setShowEnrollmentMessage({
              show: true,
              message: "Payment cancelled",
              type: 'info'
            });
            setTimeout(() => setShowEnrollmentMessage({ show: false, message: '', type: '' }), 3000);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      setShowEnrollmentMessage({
        show: true,
        message: error.message || "Failed to process payment. Please try again.",
        type: 'error'
      });
      setTimeout(() => setShowEnrollmentMessage({ show: false, message: '', type: '' }), 3000);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const enrollForFree = async () => {
    try {
      setEnrollmentLoading(true);
      const res = await axios.post(api.enrollment.enrollCourse, {
        studentId: studentId,
        courseId: courseId
      });
      
      if (res.data.message === "Already enrolled") {
        setShowEnrollmentMessage({
          show: true,
          message: "You are already enrolled in this course!",
          type: 'info'
        });
        setIsEnrolled(true);
        setTimeout(() => setShowEnrollmentMessage({ show: false, message: '', type: '' }), 3000);
      } else if (res.data.success) {
        setShowEnrollmentMessage({
          show: true,
          message: "Successfully enrolled in the course! 🎉",
          type: 'success'
        });
        setIsEnrolled(true);
        
        setTimeout(() => {
          setShowEnrollmentMessage({ show: false, message: '', type: '' });
          navigate('/stdprofile');
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      setShowEnrollmentMessage({
        show: true,
        message: error.response?.data?.message || "Failed to enroll. Please try again.",
        type: 'error'
      });
      setTimeout(() => setShowEnrollmentMessage({ show: false, message: '', type: '' }), 3000);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const completeEnrollment = async () => {
    try {
      const res = await axios.post(api.enrollment.enrollCourse, {
        studentId: studentId,
        courseId: courseId
      });
      
      if (res.data.success) {
        setShowEnrollmentMessage({
          show: true,
          message: "Payment successful! You are now enrolled in the course! 🎉",
          type: 'success'
        });
        setIsEnrolled(true);
        
        setTimeout(() => {
          setShowEnrollmentMessage({ show: false, message: '', type: '' });
          navigate('/stdprofile');
        }, 2000);
      }
    } catch (error) {
      console.error("Enrollment error after payment:", error);
      setShowEnrollmentMessage({
        show: true,
        message: "Payment successful but enrollment failed. Please contact support.",
        type: 'error'
      });
      setTimeout(() => setShowEnrollmentMessage({ show: false, message: '', type: '' }), 3000);
    }
  };

  const handlePlayVideo = (videoUrl, topicTitle, isPreviewFree) => {
    if (!isEnrolled && !isPreviewFree) {
      setShowEnrollmentMessage({
        show: true,
        message: "You need to enroll in this course to access this video!",
        type: 'error'
      });
      setTimeout(() => setShowEnrollmentMessage({ show: false, message: '', type: '' }), 3000);
      return;
    }
    setCurrentVideo({ url: videoUrl, title: topicTitle });
    setShowVideoPlayer(true);
  };

  const handleViewNotes = (notesUrl, topicTitle, isPreviewFree) => {
    if (!isEnrolled && !isPreviewFree) {
      setShowEnrollmentMessage({
        show: true,
        message: "You need to enroll in this course to access these notes!",
        type: 'error'
      });
      setTimeout(() => setShowEnrollmentMessage({ show: false, message: '', type: '' }), 3000);
      return;
    }
    window.open(notesUrl, '_blank');
  };

  const toggleModule = (moduleIndex) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleIndex]: !prev[moduleIndex]
    }));
  };

  const toggleChapter = (moduleIndex, chapterIndex) => {
    const key = `${moduleIndex}-${chapterIndex}`;
    setExpandedChapters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const showTopicDetails = (topic) => {
    setSelectedTopic(topic);
  };

  const calculateTotalDuration = () => {
    if (!course?.modules) return 0;
    let totalMinutes = 0;
    course.modules.forEach(module => {
      module.chapters?.forEach(chapter => {
        chapter.topics?.forEach(topic => {
          totalMinutes += topic.duration || 10;
        });
      });
    });
    return totalMinutes;
  };

  const calculateTotalTopics = () => {
    if (!course?.modules) return 0;
    let totalTopics = 0;
    course.modules.forEach(module => {
      module.chapters?.forEach(chapter => {
        totalTopics += chapter.topics?.length || 0;
      });
    });
    return totalTopics;
  };

  const calculateCompletedTopics = () => {
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-6">{error || "The course you're looking for doesn't exist."}</p>
          <button 
            onClick={() => navigate('/course')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const totalDuration = calculateTotalDuration();
  const totalTopics = calculateTotalTopics();
  const completedTopics = calculateCompletedTopics();
  const progress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Message */}
      {showEnrollmentMessage.show && (
        <div className={`fixed top-20 right-4 z-50 animate-slide-in ${
          showEnrollmentMessage.type === 'success' ? 'bg-green-500' : 
          showEnrollmentMessage.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white px-6 py-3 rounded-lg shadow-lg`}>
          {showEnrollmentMessage.message}
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button 
            onClick={() => navigate('/course')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            ← Back to Courses
          </button>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>
              <p className="text-gray-600 text-base mb-4">{course.description || 'No description available'}</p>
              
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {course.category?.name || 'General'}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {course.level || 'Beginner'}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  📚 {course.modules?.length || 0} Modules
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  📖 {totalTopics} Topics
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  ⏱️ {Math.floor(totalDuration / 60)}h {totalDuration % 60}min
                </span>
              </div>
            </div>
            
            <div className="md:w-72">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                {!isEnrolled ? (
                  <>
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {course.price && course.price > 0 ? (
                          <>₹{course.price.toLocaleString('en-IN')}</>
                        ) : (
                          'Free'
                        )}
                      </div>
                      <p className="text-gray-500 text-sm">Full course access</p>
                    </div>
                    <button
                      onClick={handleEnrollWithPayment}
                      disabled={enrollmentLoading || paymentProcessing}
                      className="w-full py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {(enrollmentLoading || paymentProcessing) ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {paymentProcessing ? 'Processing...' : 'Enrolling...'}
                        </span>
                      ) : course.price && course.price > 0 ? (
                        `Enroll Now - ₹${course.price}`
                      ) : (
                        'Enroll Now'
                      )}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-3">
                      {course.price && course.price > 0 
                        ? 'Secure payment via Razorpay'
                        : 'Get lifetime access to all content'
                      }
                    </p>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="text-green-500 text-4xl mb-2">✓</div>
                    <p className="font-semibold text-gray-900">You're enrolled!</p>
                    <p className="text-sm text-gray-600 mt-1">Full access to all content</p>
                    {progress > 0 && (
                      <div className="mt-4">
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% Complete</p>
                      </div>
                    )}
                    <button
                      onClick={() => navigate('/stdprofile')}
                      className="mt-4 text-sm text-blue-500 hover:text-blue-600"
                    >
                      Go to Profile →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of your component remains the same */}
      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-1 font-medium transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`py-3 px-1 font-medium transition-colors border-b-2 ${
                activeTab === 'curriculum'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Curriculum
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'overview' ? (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* About Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About this course</h2>
                <p className="text-gray-700 leading-relaxed">{course.description || 'No description available'}</p>
              </div>

              {/* What you'll learn */}
              {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">What you'll learn</h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {course.whatYouWillLearn.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h2>
                  <ul className="space-y-2">
                    {course.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-gray-700 text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Instructor Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Instructor</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {course.instructor?.name?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{course.instructor?.name || 'Expert Instructor'}</p>
                    <p className="text-sm text-gray-500">{course.instructor?.title || 'Professional Trainer'}</p>
                  </div>
                </div>
              </div>

              {/* Course Stats */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Course Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Total Modules</span>
                    <span className="font-semibold text-gray-900">{course.modules?.length || 0}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Total Topics</span>
                    <span className="font-semibold text-gray-900">{totalTopics}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Total Duration</span>
                    <span className="font-semibold text-gray-900">{Math.floor(totalDuration / 60)}h {totalDuration % 60}min</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Level</span>
                    <span className="font-semibold text-gray-900">{course.level || 'Beginner'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Curriculum Tab with Dropdowns and Topic Details */
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Course Curriculum</h2>
              <p className="text-gray-500 text-sm mt-1">{course.modules?.length || 0} modules • {totalTopics} topics</p>
            </div>

            {course.modules && course.modules.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {course.modules.map((module, moduleIndex) => (
                  <div key={module._id || moduleIndex} className="bg-white">
                    {/* Module Header */}
                    <button
                      onClick={() => toggleModule(moduleIndex)}
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedModules[moduleIndex] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Module {moduleIndex + 1}: {module.title}
                          </h3>
                          {module.description && (
                            <p className="text-sm text-gray-500 mt-0.5">{module.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{module.chapters?.reduce((acc, ch) => acc + (ch.topics?.length || 0), 0)} topics</span>
                      </div>
                    </button>

                    {/* Module Content */}
                    {expandedModules[moduleIndex] && (
                      <div className="border-t border-gray-100 bg-gray-50">
                        {module.chapters?.map((chapter, chapterIndex) => (
                          <div key={chapter._id || chapterIndex} className="border-b border-gray-100 last:border-b-0">
                            {/* Chapter Header */}
                            <button
                              onClick={() => toggleChapter(moduleIndex, chapterIndex)}
                              className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors text-left"
                            >
                              <div className="flex items-center gap-2">
                                <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedChapters[`${moduleIndex}-${chapterIndex}`] ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="font-medium text-gray-800 text-sm">
                                  Chapter {chapterIndex + 1}: {chapter.title}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">{chapter.topics?.length || 0} topics</span>
                            </button>

                            {/* Topics List */}
                            {expandedChapters[`${moduleIndex}-${chapterIndex}`] && (
                              <div className="px-5 pb-3 space-y-2">
                                {chapter.topics?.map((topic, topicIndex) => {
                                  const isPreviewFree = topic.isPreviewFree || false;
                                  const canAccess = isEnrolled || isPreviewFree;
                                  
                                  return (
                                    <div key={topic._id || topicIndex} className="ml-6 border border-gray-200 rounded-lg bg-white overflow-hidden">
                                      {/* Topic Header */}
                                      <div className="p-3 flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2 flex-1">
                                          <div className="text-gray-400">
                                            {canAccess ? (
                                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                              </svg>
                                            ) : (
                                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                              </svg>
                                            )}
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-800 text-sm">
                                              {topicIndex + 1}. {topic.title}
                                            </span>
                                            {topic.duration && (
                                              <span className="ml-2 text-xs text-gray-500">⏱️ {topic.duration} min</span>
                                            )}
                                            {!isEnrolled && isPreviewFree && (
                                              <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Preview</span>
                                            )}
                                            {!isEnrolled && !isPreviewFree && (
                                              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Locked</span>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                          {topic.videoUrl && (
                                            <button
                                              onClick={() => handlePlayVideo(topic.videoUrl, topic.title, isPreviewFree)}
                                              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                                                canAccess
                                                  ? 'bg-red-500 hover:bg-red-600 text-white'
                                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                              }`}
                                              disabled={!canAccess}
                                            >
                                              ▶ Watch
                                            </button>
                                          )}
                                          {topic.notes && (
                                            <button
                                              onClick={() => handleViewNotes(topic.notes, topic.title, isPreviewFree)}
                                              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                                                canAccess
                                                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                              }`}
                                              disabled={!canAccess}
                                            >
                                              📄 Notes
                                            </button>
                                          )}
                                          <button
                                            onClick={() => showTopicDetails(topic)}
                                            className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center gap-1"
                                          >
                                            📋 Details
                                          </button>
                                        </div>
                                      </div>

                                      {/* Topic Details - Expandable */}
                                      {selectedTopic?._id === topic._id && (
                                        <div className="border-t border-gray-100 p-3 bg-gray-50">
                                          <div className="space-y-2 text-sm">
                                            {topic.description && (
                                              <div>
                                                <span className="font-medium text-gray-700">Description:</span>
                                                <p className="text-gray-600 mt-1">{topic.description}</p>
                                              </div>
                                            )}
                                            {topic.resources && topic.resources.length > 0 && (
                                              <div>
                                                <span className="font-medium text-gray-700">Resources:</span>
                                                <ul className="mt-1 space-y-1">
                                                  {topic.resources.map((resource, idx) => (
                                                    <li key={idx}>
                                                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                                                        📎 {resource.name || `Resource ${idx + 1}`}
                                                      </a>
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}
                                            {topic.quiz && (
                                              <div>
                                                <span className="font-medium text-gray-700">Quiz Available:</span>
                                                <p className="text-gray-600 text-sm">Test your knowledge after this topic</p>
                                              </div>
                                            )}
                                            <button
                                              onClick={() => setSelectedTopic(null)}
                                              className="text-xs text-gray-500 hover:text-gray-700 mt-2"
                                            >
                                              Hide details
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                {(!chapter.topics || chapter.topics.length === 0) && (
                                  <div className="ml-6 p-3 text-gray-500 text-sm italic">
                                    No topics in this chapter yet.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {(!module.chapters || module.chapters.length === 0) && (
                          <div className="px-5 py-3 text-gray-500 text-sm italic">
                            No chapters in this module yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No content available for this course yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {showVideoPlayer && currentVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={() => {
          setShowVideoPlayer(false);
          setCurrentVideo(null);
        }}>
          <div className="bg-white rounded-lg w-full max-w-4xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-3 bg-gray-100 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">{currentVideo.title}</h3>
              <button
                onClick={() => {
                  setShowVideoPlayer(false);
                  setCurrentVideo(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200"
              >
                ×
              </button>
            </div>
            <div className="p-3 bg-black">
              <video
                controls
                autoPlay
                className="w-full rounded"
                style={{ maxHeight: '70vh' }}
                src={currentVideo.url}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CourseDetails;