import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useStudentStore from '../../../Store/studentstore';
import api from '../../../services/endpoints';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CourseDetails = () => {
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  useEffect(() => {
    if (location.state?.course) {
      setCourse(location.state.course);
      setLoading(false);
      return;
    }
  }, [location.state]);

  useEffect(() => {
    if (studentId && course?._id) {
      checkEnrollmentStatus();
    }
  }, [studentId, course]);

  const checkEnrollmentStatus = async () => {
    try {
      const res = await axios.get(`${api.student.getStudentProfile}/${studentId}`);
      if (res.data?.success && res.data?.data) {
        const studentData = res.data.data;
        if (studentData.enrolledCourses && studentData.enrolledCourses.includes(course._id)) {
          setIsEnrolled(true);
        }
      }
    } catch (error) {
      console.error("Error checking enrollment status:", error);
    }
  };

  const hasPaidContent = () => {
    if (!course?.modules) return false;
    
    for (const module of course.modules) {
      for (const chapter of module.chapters || []) {
        for (const topic of chapter.topics || []) {
          if (topic.isPreviewFree === false) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const hasPreviewContent = () => {
    if (!course?.modules) return false;
    
    for (const module of course.modules) {
      for (const chapter of module.chapters || []) {
        for (const topic of chapter.topics || []) {
          if (topic.isPreviewFree === true) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const isCompletelyFree = () => {
    return (!course?.price || course?.price === 0) && !hasPaidContent();
  };

  const isPaidCourse = () => {
    return (course?.price && course?.price > 0) || hasPaidContent();
  };

  const getEnrollmentRequirement = () => {
    if (isCompletelyFree()) {
      return { type: 'free', message: 'This course is completely free!', action: 'View Course' };
    } else if (hasPaidContent() && hasPreviewContent()) {
      return { type: 'mixed', message: 'This course has both free preview and paid content.', action: `Enroll Now - ₹${course?.price || 0}` };
    } else if (hasPaidContent() && !hasPreviewContent()) {
      return { type: 'paid', message: 'Full course access requires payment.', action: `Enroll Now - ₹${course?.price || 0}` };
    } else if (course?.price > 0) {
      return { type: 'paid', message: 'This is a premium course.', action: `Enroll Now - ₹${course?.price || 0}` };
    } else {
      return { type: 'preview', message: 'All topics are available as free preview!', action: 'View Course' };
    }
  };

const createRazorpayPayment = async () => {
  try {
    const response = await axios.post(api.payment.createPayment, {
      courseId: course._id,
      studentId: studentId,
    });

    if (response.data.success) {
      // Store enrollmentId in component state or ref instead of window
      return {
        order: response.data.order,
        enrollmentId: response.data.enrollmentId
      };
    } else {
      throw new Error(response.data.message || 'Failed to create order');
    }
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

const verifyPayment = async (paymentData, enrollmentId) => {
  try {
    const verificationData = {
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature,
      enrollmentId: enrollmentId
    };
    
    console.log("Sending verification data:", verificationData);
    
    const response = await axios.post(api.payment.verifyPayment, verificationData);
    
    console.log("Verification response:", response.data);
    
    if (response.data.success) {
      console.log("Payment verified, enrollment status:", response.data.data?.status);
    }
    
    return response.data;
  } catch (error) {
    console.error("Error verifying payment:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

  const completeEnrollment = async () => {
    try {
      setEnrollmentLoading(true);
      const res = await axios.get(`${api.student.getStudentProfile}/${studentId}`);
      if (res.data?.success && res.data?.data) {
        const studentData = res.data.data;
        if (studentData.enrolledCourses && studentData.enrolledCourses.includes(course._id)) {
          setIsEnrolled(true);
        }
      }
      
      setShowEnrollmentMessage({
        show: true,
        message: "Payment successful! You are now enrolled in the course! 🎉",
        type: 'success'
      });
      
      setTimeout(() => {
        setShowEnrollmentMessage({ show: false, message: '', type: '' });
      }, 2000);
    } catch (error) {
      console.error("Error after payment:", error);
      setShowEnrollmentMessage({
        show: true,
        message: "Payment successful but please contact support to complete enrollment.",
        type: 'error'
      });
      setTimeout(() => setShowEnrollmentMessage({ show: false, message: '', type: '' }), 3000);
    } finally {
      setEnrollmentLoading(false);
    }
  };

const processRazorpayPayment = async () => {
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
    const { order, enrollmentId } = await createRazorpayPayment();
    
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: course.title,
      description: `Enrollment for ${course.title}`,
      order_id: order.id,
      handler: async (response) => {
        try {
          const paymentVerification = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }, enrollmentId);

          if (paymentVerification.success) {
            setIsEnrolled(true);
            setShowEnrollmentMessage({
              show: true,
              message: "Payment successful! You are now enrolled in the course! 🎉",
              type: 'success'
            });
            setTimeout(() => {
              setShowEnrollmentMessage({ show: false, message: '', type: '' });
            }, 3000);
          } else {
            setShowEnrollmentMessage({
              show: true,
              message: "Payment verification failed. Please contact support.",
              type: 'error'
            });
            setTimeout(() => setShowEnrollmentMessage({ show: false, message: '', type: '' }), 3000);
          }
        } catch (error) {
          console.error("Verification error:", error);
          setShowEnrollmentMessage({
            show: true,
            message: "Payment verification failed. Please contact support.",
            type: 'error'
          });
          setTimeout(() => setShowEnrollmentMessage({ show: false, message: '', type: '' }), 3000);
        } finally {
          setPaymentProcessing(false);
        }
      },
      prefill: {
        name: student?.name || '',
        email: student?.email || '',
        contact: student?.phone || ''
      },
      notes: {
        studentId: studentId,
        courseId: course._id
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
    setPaymentProcessing(false);
  }
};

  const handlePayment = async () => {
    setShowPaymentModal(false);
    await processRazorpayPayment();
  };

  const handleEnrollClick = () => {
    if (!studentId) {
      setShowEnrollmentMessage({
        show: true,
        message: "Please login to enroll in this course",
        type: 'error'
      });
      setTimeout(() => setShowEnrollmentMessage({ show: false, message: '', type: '' }), 3000);
      return;
    }

    if (isCompletelyFree()) {
      handleViewCourse();
      return;
    }

    if (isPaidCourse()) {
      setShowPaymentModal(true);
      return;
    }
    
    handleViewCourse();
  };

  const handleViewCourse = () => {
    if (isEnrolled || isCompletelyFree()) {
      navigate(`/course-content/${course._id}`, { state: { course } });
    } else if (isCompletelyFree()) {
      navigate(`/course-content/${course._id}`, { state: { course } });
    }
  };

  const handlePlayVideo = (videoUrl, topicTitle, isPreviewFree) => {
    if (isCompletelyFree()) {
      setCurrentVideo({ url: videoUrl, title: topicTitle });
      setShowVideoPlayer(true);
      return;
    }
    
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
    if (isCompletelyFree()) {
      window.open(notesUrl, '_blank');
      return;
    }
    
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
    setSelectedTopic(selectedTopic?._id === topic._id ? null : topic);
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

  const calculateFreeTopics = () => {
    if (!course?.modules) return 0;
    let freeTopics = 0;
    course.modules.forEach(module => {
      module.chapters?.forEach(chapter => {
        chapter.topics?.forEach(topic => {
          if (topic.isPreviewFree === true) freeTopics++;
        });
      });
    });
    return freeTopics;
  };

  const calculatePaidTopics = () => {
    if (!course?.modules) return 0;
    let paidTopics = 0;
    course.modules.forEach(module => {
      module.chapters?.forEach(chapter => {
        chapter.topics?.forEach(topic => {
          if (topic.isPreviewFree === false) paidTopics++;
        });
      });
    });
    return paidTopics;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-6">{error || "The course you're looking for doesn't exist."}</p>
          <button 
            onClick={() => navigate('/course')}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const totalDuration = calculateTotalDuration();
  const totalTopics = calculateTotalTopics();
  const freeTopics = calculateFreeTopics();
  const paidTopics = calculatePaidTopics();
  const enrollmentInfo = getEnrollmentRequirement();
  const isFree = isCompletelyFree();
  const isPaid = isPaidCourse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Toast Message */}
      {showEnrollmentMessage.show && (
        <div className={`fixed top-20 right-4 z-50 animate-slide-in ${
          showEnrollmentMessage.type === 'success' ? 'bg-green-500' : 
          showEnrollmentMessage.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm`}>
          <div className="flex items-center gap-2">
            {showEnrollmentMessage.type === 'success' && <span>✅</span>}
            {showEnrollmentMessage.type === 'error' && <span>❌</span>}
            {showEnrollmentMessage.type === 'info' && <span>ℹ️</span>}
            {showEnrollmentMessage.message}
          </div>
        </div>
      )}

      {showPaymentModal && isPaid && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => !paymentProcessing && setShowPaymentModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Complete Your Enrollment</h3>
              <p className="text-gray-600 mt-2">Course: {course.title}</p>
              <p className="text-2xl font-bold text-blue-600 mt-3">₹{course.price?.toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total Topics:</span>
                <span className="font-semibold">{totalTopics}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Free Preview Topics:</span>
                <span className="font-semibold text-green-600">{freeTopics}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Premium Topics:</span>
                <span className="font-semibold text-orange-600">{paidTopics}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center justify-between flex-1">
                    <span className="font-medium">Razorpay</span>
                    <img 
                      src="https://razorpay.com/assets/razorpay-glyph.svg" 
                      alt="Razorpay" 
                      className="h-6"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePayment}
                disabled={paymentProcessing}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {paymentProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay ₹${course.price} & Enroll`
                )}
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                disabled={paymentProcessing}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Secure payment powered by Razorpay
            </p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button 
            onClick={() => navigate('/course')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Courses
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {course.category?.name || 'General'}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {course.level || 'Beginner'}
                </span>
                {isFree ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Free Course
                  </span>
                ) : (
                  <>
                    {!isEnrolled && (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                        Premium Course
                      </span>
                    )}
                    {!isEnrolled && hasPreviewContent() && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        Free Preview Available
                      </span>
                    )}
                  </>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-gray-600 text-lg mb-4">{course.description || 'No description available'}</p>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-sm text-gray-700">{course.modules?.length || 0} Modules</span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-sm text-gray-700">{totalTopics} Topics</span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-700">{Math.floor(totalDuration / 60)}h {totalDuration % 60}min</span>
                </div>
              </div>
            </div>
            
            <div className="lg:w-80">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                {!isEnrolled ? (
                  <>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-gray-900">
                        {isFree ? (
                          'Free'
                        ) : (
                          <>₹{course.price?.toLocaleString('en-IN') || 'Premium'}</>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mt-1">{enrollmentInfo.message}</p>
                    </div>
                    
                    <button
                      onClick={handleEnrollClick}
                      disabled={enrollmentLoading || paymentProcessing}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {(enrollmentLoading || paymentProcessing) ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {paymentProcessing ? 'Processing...' : 'Loading...'}
                        </span>
                      ) : (
                        enrollmentInfo.action
                      )}
                    </button>
                    
                    {!isFree && (
                      <div className="mt-4 space-y-2 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Free Topics:</span>
                          <span className="font-semibold text-green-600">{freeTopics} topics</span>
                        </div>
                        {paidTopics > 0 && (
                          <div className="flex justify-between">
                            <span>Premium Topics:</span>
                            <span className="font-semibold text-orange-600">{paidTopics} topics</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">You're enrolled!</p>
                    <p className="text-sm text-gray-600 mt-1">Full access to all content</p>
                    <button
                      onClick={handleViewCourse}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1"
                    >
                      Start Learning
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-[88px] z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 font-medium transition-all duration-200 border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`py-4 px-1 font-medium transition-all duration-200 border-b-2 ${
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About this course</h2>
                <p className="text-gray-700 leading-relaxed">{course.description || 'No description available'}</p>
              </div>

              {/* What you'll learn */}
              {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">What you'll learn</h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {course.whatYouWillLearn.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 group">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-green-200 transition-colors">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {course.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 group">
                        <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-orange-200 transition-colors">
                          <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Instructor Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-gray-900 mb-4">Instructor</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {course.instructor?.name?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{course.instructor?.name || 'Expert Instructor'}</p>
                    <p className="text-sm text-gray-500">{course.instructor?.title || 'Professional Trainer'}</p>
                  </div>
                </div>
              </div>

              {/* Course Stats */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-gray-900 mb-4">Course Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Total Modules</span>
                    <span className="font-semibold text-gray-900 bg-blue-50 px-3 py-1 rounded-full">{course.modules?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Total Topics</span>
                    <span className="font-semibold text-gray-900 bg-purple-50 px-3 py-1 rounded-full">{totalTopics}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Free Topics</span>
                    <span className="font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">{freeTopics}</span>
                  </div>
                  {paidTopics > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Premium Topics</span>
                      <span className="font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">{paidTopics}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Total Duration</span>
                    <span className="font-semibold text-gray-900 bg-green-50 px-3 py-1 rounded-full">{Math.floor(totalDuration / 60)}h {totalDuration % 60}min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Curriculum Tab with Dropdowns and Topic Details */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-xl font-bold text-gray-900">Course Curriculum</h2>
              <p className="text-gray-600 mt-1">{course.modules?.length || 0} modules • {totalTopics} topics • {freeTopics} free previews</p>
            </div>

            {course.modules && course.modules.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {course.modules.map((module, moduleIndex) => (
                  <div key={module._id || moduleIndex} className="bg-white">
                    {/* Module Header */}
                    <button
                      onClick={() => toggleModule(moduleIndex)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedModules[moduleIndex] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Module {moduleIndex + 1}: {module.title}
                          </h3>
                          {module.description && (
                            <p className="text-sm text-gray-500 mt-0.5">{module.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
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
                              className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors text-left"
                            >
                              <div className="flex items-center gap-2">
                                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedChapters[`${moduleIndex}-${chapterIndex}`] ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="font-medium text-gray-800">
                                  Chapter {chapterIndex + 1}: {chapter.title}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">{chapter.topics?.length || 0} topics</span>
                            </button>

                            {/* Topics List */}
                            {expandedChapters[`${moduleIndex}-${chapterIndex}`] && (
                              <div className="px-6 pb-4 space-y-2">
                                {chapter.topics?.map((topic, topicIndex) => {
                                  const isPreviewFree = topic.isPreviewFree === true;
                                  const canAccess = isEnrolled || isPreviewFree || isFree;
                                  
                                  return (
                                    <div key={topic._id || topicIndex} className="ml-6 border border-gray-200 rounded-xl bg-white overflow-hidden hover:shadow-md transition-shadow">
                                      {/* Topic Header */}
                                      <div className="p-4 flex items-center justify-between flex-wrap gap-3">
                                        <div className="flex items-center gap-3 flex-1">
                                          <div className="flex-shrink-0">
                                            {canAccess ? (
                                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                </svg>
                                              </div>
                                            ) : (
                                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-900">
                                              {topicIndex + 1}. {topic.title}
                                            </span>
                                            {topic.duration && (
                                              <span className="ml-2 text-xs text-gray-500">⏱️ {topic.duration} min</span>
                                            )}
                                            <div className="flex gap-2 mt-1">
                                              {!isFree && !isEnrolled && isPreviewFree && (
                                                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Free Preview</span>
                                              )}
                                              {!isFree && !isEnrolled && !isPreviewFree && (
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Premium Content</span>
                                              )}
                                              {(isEnrolled || isFree) && (
                                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                                  {isFree ? 'Free Access' : 'Enrolled Access'}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                          {topic.videoUrl && (
                                            <button
                                              onClick={() => handlePlayVideo(topic.videoUrl, topic.title, isPreviewFree)}
                                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                                                canAccess
                                                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm'
                                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                              }`}
                                              disabled={!canAccess}
                                            >
                                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                              </svg>
                                              Watch
                                            </button>
                                          )}
                                          {topic.notesUrl && (
                                            <button
                                              onClick={() => handleViewNotes(topic.notesUrl, topic.title, isPreviewFree)}
                                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                                                canAccess
                                                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm'
                                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                              }`}
                                              disabled={!canAccess}
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                              </svg>
                                              Notes
                                            </button>
                                          )}
                                          <button
                                            onClick={() => showTopicDetails(topic)}
                                            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 flex items-center gap-1"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Details
                                          </button>
                                        </div>
                                      </div>

                                      {/* Topic Details - Expandable */}
                                      {selectedTopic?._id === topic._id && (
                                        <div className="border-t border-gray-100 p-4 bg-gray-50">
                                          <div className="space-y-3 text-sm">
                                            {topic.description && (
                                              <div>
                                                <span className="font-semibold text-gray-700">Description:</span>
                                                <p className="text-gray-600 mt-1">{topic.description}</p>
                                              </div>
                                            )}
                                            {topic.resources && topic.resources.length > 0 && (
                                              <div>
                                                <span className="font-semibold text-gray-700">Resources:</span>
                                                <ul className="mt-2 space-y-1">
                                                  {topic.resources.map((resource, idx) => (
                                                    <li key={idx}>
                                                      <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                                        </svg>
                                                        {resource.title || `Resource ${idx + 1}`}
                                                      </a>
                                                    </li>
                                                  ))}
                                                </ul>
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
                                  <div className="ml-6 p-4 text-gray-500 text-sm italic bg-white rounded-lg">
                                    No topics in this chapter yet.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {(!module.chapters || module.chapters.length === 0) && (
                          <div className="px-6 py-4 text-gray-500 text-sm italic">
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
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4" onClick={() => {
          setShowVideoPlayer(false);
          setCurrentVideo(null);
        }}>
          <div className="bg-white rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-800 to-gray-900">
              <h3 className="font-semibold text-white">{currentVideo.title}</h3>
              <button
                onClick={() => {
                  setShowVideoPlayer(false);
                  setCurrentVideo(null);
                }}
                className="text-gray-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-4 bg-black">
              <video
                controls
                autoPlay
                className="w-full rounded-lg"
                style={{ maxHeight: '75vh' }}
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