import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useStudentStore from '../../../Store/studentstore';
import api from '../../../services/endpoints';
import {
  ArrowLeft, BookOpen, Clock, ChevronDown, ChevronRight,
  Play, FileText, Lock, Unlock, CheckCircle, X, CreditCard,
  GraduationCap, Users, Info, Download
} from 'lucide-react';
import jsPDF from 'jspdf';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*[?&]v=([^&]+)/,
  ];
  let videoId = null;
  for (const p of patterns) {
    const m = url.match(p);
    if (m?.[1]) { videoId = m[1].split('?')[0].split('&')[0]; break; }
  }
  return videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`
    : url;
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// ─── PDF Download Function (pure jsPDF, no html2canvas, no crash) ────────────
const downloadNotesAsPDF = (topic) => {
  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 15;
    const contentW = pageW - margin * 2;
    let y = 20;

    const addText = (text, fontSize, bold = false, color = [30, 30, 30]) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', bold ? 'bold' : 'normal');
      pdf.setTextColor(...color);
      const lines = pdf.splitTextToSize(String(text || ''), contentW);
      lines.forEach((line) => {
        if (y > 275) { pdf.addPage(); y = 20; }
        pdf.text(line, margin, y);
        y += fontSize * 0.45;
      });
    };

    // ── Header ──
    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, 0, 210, 28, 'F');
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('Course Notes', margin, 12);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, 20);
    y = 38;

    // ── Topic Title ──
    addText(topic.title, 15, true, [17, 24, 39]);
    y += 2;

    // ── Divider ──
    pdf.setDrawColor(229, 231, 235);
    pdf.line(margin, y, pageW - margin, y);
    y += 6;

    // ── Description ──
    if (topic.description) {
      addText('Description', 10, true, [107, 114, 128]);
      y += 1;
      const descText = topic.description.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
      addText(descText, 10, false, [75, 85, 99]);
      y += 5;
    }

    // ── Notes ──
    addText('Notes', 11, true, [37, 99, 235]);
    y += 2;
    const notesText = topic.notes
      ? topic.notes.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
      : 'No notes available for this topic.';
    addText(notesText, 10, false, [55, 65, 81]);

    // ── Footer ──
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text(`Page ${i} of ${pageCount}`, pageW - margin, 290, { align: 'right' });
    }

    pdf.save(`${topic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.pdf`);

    // ── Success toast ──
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:20px;right:16px;z-index:9999;padding:12px 18px;background:#22c55e;color:#fff;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.15)';
    t.textContent = '✓ PDF Downloaded!';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);

  } catch (err) {
    console.error('PDF error:', err);
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:20px;right:16px;z-index:9999;padding:12px 18px;background:#ef4444;color:#fff;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.15)';
    t.textContent = '✗ Failed to generate PDF';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
const CourseDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { student, setStudent } = useStudentStore();
  const studentId = student?._id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // ── Load course ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (location.state?.course) {
      setCourse(location.state.course);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [location.state]);

  useEffect(() => {
    if (studentId && course?._id) checkEnrollment();
  }, [studentId, course]);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const checkEnrollment = async () => {
    try {
      const res = await axios.get(`${api.student.getStudentProfile}/${studentId}`);
      if (res.data?.success) {
        const enrolled = res.data.data?.enrolledCourses?.includes(course._id);
        setIsEnrolled(!!enrolled);
      }
    } catch { /* silent */ }
  };

  // ── Course helpers ───────────────────────────────────────────────────────────
  const hasPaidContent = () =>
    course?.modules?.some(m => m.chapters?.some(c => c.topics?.some(t => t.isPreviewFree === false)));

  const hasPreviewContent = () =>
    course?.modules?.some(m => m.chapters?.some(c => c.topics?.some(t => t.isPreviewFree === true)));

  const isCompletelyFree = () => (!course?.price || course.price === 0) && !hasPaidContent();

  const isPaidCourse = () => (course?.price && course.price > 0) || hasPaidContent();

  const totalTopics = () =>
    course?.modules?.reduce((s, m) => s + (m.chapters?.reduce((cs, c) => cs + (c.topics?.length || 0), 0) || 0), 0) || 0;

  const freeTopics = () =>
    course?.modules?.reduce((s, m) => s + (m.chapters?.reduce((cs, c) => cs + c.topics?.filter(t => t.isPreviewFree).length, 0) || 0), 0) || 0;

  const paidTopics = () =>
    course?.modules?.reduce((s, m) => s + (m.chapters?.reduce((cs, c) => cs + c.topics?.filter(t => !t.isPreviewFree).length, 0) || 0), 0) || 0;

  const enrollmentInfo = () => {
    if (isEnrolled) return { action: 'Continue Learning', type: 'enrolled' };
    if (isCompletelyFree()) return { action: 'Start Learning — Free', type: 'free' };
    return { action: `Enroll Now — ₹${course?.price || 0}`, type: 'paid' };
  };

  // ── Payment ─────────────────────────────────────────────────────────────────
  const handleEnrollClick = () => {
    if (!studentId) return showToast('Please log in to enroll', 'error');
    if (isEnrolled || isCompletelyFree()) return navigate(`/course-content/${course._id}`, { state: { course } });
    if (isPaidCourse()) return setShowPaymentModal(true);
    navigate(`/course-content/${course._id}`, { state: { course } });
  };

  const processPayment = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) return showToast('Payment gateway failed to load', 'error');
    setPaymentProcessing(true);
    try {
      const { data } = await axios.post(api.payment.createPayment, { courseId: course._id, studentId });
      if (!data.success) throw new Error(data.message);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: course.title,
        order_id: data.order.id,
        handler: async (resp) => {
          try {
            const verify = await axios.post(api.payment.verifyPayment, {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              enrollmentId: data.enrollmentId,
            });
            if (verify.data.success) {
              setIsEnrolled(true);
              showToast('Payment successful! You are now enrolled 🎉', 'success');
            }
          } catch { showToast('Payment verification failed. Contact support.', 'error'); }
          finally { setPaymentProcessing(false); }
        },
        prefill: { name: student?.name || '', email: student?.email || '', contact: student?.phone || '' },
        theme: { color: '#2563EB' },
        modal: { ondismiss: () => { setPaymentProcessing(false); showToast('Payment cancelled', 'info'); } },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      showToast(err.response?.data?.message || 'Payment failed. Try again.', 'error');
      setPaymentProcessing(false);
    }
  };

  const handlePayment = async () => {
    setShowPaymentModal(false);
    await processPayment();
  };

  // ── Video ────────────────────────────────────────────────────────────────────
  const playVideo = (topic) => {
    const hasAccess = isEnrolled || topic.isPreviewFree || isCompletelyFree();
    if (!hasAccess) return showToast('Enroll to access this lesson', 'error');
    if (!topic.videoUrl) return showToast('No video available for this lesson', 'error');
    const isYT = topic.videoUrl.includes('youtube.com') || topic.videoUrl.includes('youtu.be');
    setCurrentVideo({
      url: isYT ? getYouTubeEmbedUrl(topic.videoUrl) : topic.videoUrl,
      title: topic.title,
      type: isYT ? 'youtube' : 'upload',
    });
    setShowVideoPlayer(true);
  };

  const openNotes = (topic) => {
    const hasAccess = isEnrolled || topic.isPreviewFree || isCompletelyFree();
    if (!hasAccess) return showToast('Enroll to access notes', 'error');
    // Direct download — no new tab, no Save As dialog
    const a = document.createElement('a');
    a.href = topic.notesUrl;
    a.download = `${(topic.title || 'notes').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes`;
    a.target = '_self';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ── Download Notes as PDF ─────────────────────────────────────────────────
  const handleDownloadNotesPDF = async (topic) => {
    const hasAccess = isEnrolled || topic.isPreviewFree || isCompletelyFree();
    if (!hasAccess) return showToast('Enroll to access notes', 'error');

    if (!topic.notes && !topic.notesUrl) {
      return showToast('No notes available for download', 'error');
    }

    // If we have a URL, it means the notes are an uploaded file (like a PDF).
    // Download it directly instead of trying to parse it as text.
    if (topic.notesUrl) {
      try {
        // Show downloading toast
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;top:20px;right:16px;z-index:9999;padding:12px 18px;background:#3b82f6;color:#fff;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.15)';
        toast.textContent = '⏳ Downloading...';
        document.body.appendChild(toast);

        const response = await fetch(topic.notesUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const contentType = response.headers.get('content-type') || '';
        let ext = 'pdf';
        if (contentType.includes('word') || topic.notesUrl.includes('.doc')) ext = 'docx';
        else if (contentType.includes('png')) ext = 'png';
        else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
        else if (topic.notesUrl.match(/\.(\w+)(\?|$)/)) {
          ext = topic.notesUrl.match(/\.(\w+)(\?|$)/)[1];
        }

        const a = document.createElement('a');
        a.href = url;
        a.download = `${(topic.title || 'notes').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.remove();

        const success = document.createElement('div');
        success.style.cssText = 'position:fixed;top:20px;right:16px;z-index:9999;padding:12px 18px;background:#22c55e;color:#fff;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.15)';
        success.textContent = '✓ Notes Downloaded!';
        document.body.appendChild(success);
        setTimeout(() => success.remove(), 3000);

        return; // Early return since we successfully downloaded the file
      } catch (error) {
        console.error('Error fetching notes:', error);
        return showToast('Failed to download notes', 'error');
      }
    }

    // If it's pure text notes stored in DB, generate a PDF out of it
    downloadNotesAsPDF(topic);
  };

  // ── Navigate to Topic Info Page ─────────────────────────────────────────────
  const openTopicInfo = (topic) => {
    const hasAccess = isEnrolled || topic.isPreviewFree || isCompletelyFree();
    if (!hasAccess) return showToast('Enroll to access topic information', 'error');
    navigate("/topicinfo", {
      state: {
        topic,
        courseId: course._id,
        courseTitle: course.title,
        isEnrolled
      }
    });
  };

  // ── Expand toggles ───────────────────────────────────────────────────────────
  const toggleModule = (idx) => setExpandedModules(p => ({ ...p, [idx]: !p[idx] }));
  const toggleChapter = (mIdx, cIdx) => {
    const k = `${mIdx}-${cIdx}`;
    setExpandedChapters(p => ({ ...p, [k]: !p[k] }));
  };

  // ── Loading / error ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-2xl border border-gray-100 shadow max-w-sm">
          <BookOpen size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="font-semibold text-gray-800 mb-4">Course not found</p>
          <button onClick={() => navigate('/course')} className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const info = enrollmentInfo();
  const tt = totalTopics();
  const ft = freeTopics();
  const pt = paidTopics();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-5 right-4 z-[9999] px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white flex items-center gap-2 transition-all ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          }`}>
          {toast.type === 'success' && <CheckCircle size={15} />}
          {toast.type === 'error' && <X size={15} />}
          {toast.message}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => !paymentProcessing && setShowPaymentModal(false)}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Complete Enrollment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="p-6">
              <div className="text-center mb-5">
                <p className="text-sm text-gray-500 mb-1">{course.title}</p>
                <p className="text-3xl font-bold text-gray-900">₹{course.price?.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Total lessons</span><span className="font-medium text-gray-900">{tt}</span></div>
                <div className="flex justify-between text-gray-600"><span>Free preview</span><span className="font-medium text-green-600">{ft} lessons</span></div>
                {pt > 0 && <div className="flex justify-between text-gray-600"><span>Premium lessons</span><span className="font-medium text-blue-600">{pt}</span></div>}
              </div>
              <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl mb-5">
                <CreditCard size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Razorpay — Secure Payment</span>
              </div>
              <button onClick={handlePayment} disabled={paymentProcessing} className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {paymentProcessing ? 'Processing...' : `Pay ₹${course.price} & Enroll`}
              </button>
              <button onClick={() => setShowPaymentModal(false)} disabled={paymentProcessing} className="w-full mt-2 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                Cancel
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">Payments are secured by Razorpay</p>
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back button */}
        <button onClick={() => navigate('/course')} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
          <ArrowLeft size={14} /> Back to Courses
        </button>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="flex-1 min-w-0">
            {/* Course header */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
              <div className="flex flex-wrap gap-2 mb-3">
                {course.category?.name && (
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{course.category.name}</span>
                )}
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md capitalize">{course.level || 'Beginner'}</span>
                {isEnrolled && <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-md flex items-center gap-1"><CheckCircle size={11} /> Enrolled</span>}
                {!isEnrolled && isCompletelyFree() && <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-md">Free</span>}
                {!isEnrolled && !isCompletelyFree() && hasPreviewContent() && <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">Free Preview Available</span>}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{course.title}</h1>
              {course.description && (
                <div className="text-gray-600 text-sm leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: course.description }} />
              )}
              <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <BookOpen size={15} className="text-blue-500" />
                  {course.modules?.length || 0} Modules
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Play size={15} className="text-purple-500" />
                  {tt} Lessons
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <GraduationCap size={15} className="text-green-500" />
                  {course.instructor?.name || 'Expert Instructor'}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit">
              {['overview', 'curriculum'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h2 className="text-base font-bold text-gray-900 mb-3">About this course</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{course.description || 'No description available.'}</p>
                </div>
                {course.whatYouWillLearn?.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h2 className="text-base font-bold text-gray-900 mb-3">What you'll learn</h2>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {course.whatYouWillLearn.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {course.requirements?.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h2 className="text-base font-bold text-gray-900 mb-3">Requirements</h2>
                    <ul className="space-y-2">
                      {course.requirements.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h2 className="text-base font-bold text-gray-900 mb-3">Instructor</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-base font-bold flex-shrink-0">
                      {(course.instructor?.name || course.instructor?.fullName || 'I')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{course.instructor?.name || course.instructor?.fullName || 'Expert Instructor'}</p>
                      <p className="text-xs text-gray-500">{course.instructor?.email || 'Professional Trainer'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h2 className="text-base font-bold text-gray-900 mb-3">Course Details</h2>
                  <div className="divide-y divide-gray-50 text-sm">
                    {[
                      ['Modules', course.modules?.length || 0, 'text-blue-600'],
                      ['Total Lessons', tt, 'text-purple-600'],
                      ['Free Lessons', ft, 'text-green-600'],
                      ...(pt > 0 ? [['Premium Lessons', pt, 'text-orange-600']] : []),
                      ['Level', <span className="capitalize">{course.level || 'Beginner'}</span>, 'text-gray-800'],
                    ].map(([label, val, cls], i) => (
                      <div key={i} className="flex justify-between py-2.5">
                        <span className="text-gray-500">{label}</span>
                        <span className={`font-semibold ${cls}`}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === 'curriculum' && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900">Course Curriculum</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {course.modules?.length || 0} modules · {tt} lessons · {ft} free previews
                  </p>
                </div>

                {course.modules?.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {course.modules.map((mod, mIdx) => (
                      <div key={mod._id || mIdx}>
                        <button
                          onClick={() => toggleModule(mIdx)}
                          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            {expandedModules[mIdx] ? <ChevronDown size={15} className="text-gray-400" /> : <ChevronRight size={15} className="text-gray-400" />}
                            <div>
                              <p className="text-sm font-semibold text-gray-900">Module {mIdx + 1}: {mod.title}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-4">
                            {mod.chapters?.reduce((s, c) => s + (c.topics?.length || 0), 0)} lessons
                          </span>
                        </button>

                        {expandedModules[mIdx] && (
                          <div className="bg-gray-50 border-t border-gray-100">
                            {mod.chapters?.map((ch, cIdx) => (
                              <div key={ch._id || cIdx} className="border-b border-gray-100 last:border-0">
                                <button
                                  onClick={() => toggleChapter(mIdx, cIdx)}
                                  className="w-full flex items-center justify-between pl-10 pr-5 py-3 hover:bg-gray-100 transition-colors text-left"
                                >
                                  <div className="flex items-center gap-2">
                                    {expandedChapters[`${mIdx}-${cIdx}`] ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />}
                                    <span className="text-sm text-gray-700 font-medium">{ch.title}</span>
                                  </div>
                                  <span className="text-xs text-gray-400 ml-4">{ch.topics?.length || 0} lessons</span>
                                </button>

                                {expandedChapters[`${mIdx}-${cIdx}`] && (
                                  <div className="pb-2 space-y-1">
                                    {ch.topics?.map((topic, tIdx) => {
                                      const hasAccess = isEnrolled || topic.isPreviewFree || isCompletelyFree();
                                      return (
                                        <div key={topic._id || tIdx} className="mx-4 rounded-xl bg-white border border-gray-100 overflow-hidden">
                                          <div className="flex items-center justify-between px-4 py-3 gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${hasAccess ? 'bg-green-50' : 'bg-gray-100'}`}>
                                                {hasAccess ? <Play size={13} className="text-green-600 ml-0.5" /> : <Lock size={12} className="text-gray-400" />}
                                              </div>
                                              <div className="min-w-0">
                                                <p className="text-sm text-gray-800 truncate">{tIdx + 1}. {topic.title}</p>
                                                <div className="flex gap-1.5 mt-0.5">
                                                  {(isEnrolled || (isCompletelyFree() && !isEnrolled)) && (
                                                    <span className="text-xs text-blue-600">Full access</span>
                                                  )}
                                                  {!isEnrolled && !isCompletelyFree() && topic.isPreviewFree && (
                                                    <span className="text-xs text-green-600">Free preview</span>
                                                  )}
                                                  {!isEnrolled && !isCompletelyFree() && !topic.isPreviewFree && (
                                                    <span className="text-xs text-gray-400">Premium</span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                              {topic.videoUrl && (
                                                <button
                                                  onClick={() => playVideo(topic)}
                                                  disabled={!hasAccess}
                                                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${hasAccess
                                                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                  <Play size={11} /> Watch
                                                </button>
                                              )}

                                              {topic.description && (
                                                <button
                                                  onClick={() => openTopicInfo(topic)}
                                                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1"
                                                >
                                                  <Info size={11} /> Info
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                    {ch.topics?.length === 0 && (
                                      <p className="text-xs text-gray-400 pl-14 py-2">No lessons added yet.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <BookOpen size={36} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm text-gray-400">No content added yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Enrollment card */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-5 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              {!isEnrolled ? (
                <>
                  <div className="p-5 text-center border-b border-gray-100">
                    <p className="text-3xl font-bold text-gray-900">
                      {isCompletelyFree() ? 'Free' : `₹${course.price?.toLocaleString('en-IN') || '0'}`}
                    </p>
                    {!isCompletelyFree() && <p className="text-xs text-gray-400 mt-1">One-time payment · Full access</p>}
                  </div>
                  <div className="p-5 space-y-4">
                    <button
                      onClick={handleEnrollClick}
                      disabled={enrollmentLoading || paymentProcessing}
                      className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
                    >
                      {(enrollmentLoading || paymentProcessing) ? 'Processing...' : info.action}
                    </button>
                    <div className="space-y-2.5 text-sm text-gray-600">
                      <div className="flex items-center gap-2"><BookOpen size={14} className="text-blue-500" /> {course.modules?.length || 0} modules</div>
                      <div className="flex items-center gap-2"><Play size={14} className="text-blue-500" /> {tt} lessons total</div>
                      {ft > 0 && <div className="flex items-center gap-2"><Unlock size={14} className="text-green-500" /> {ft} free previews</div>}
                      {pt > 0 && !isCompletelyFree() && <div className="flex items-center gap-2"><Lock size={14} className="text-gray-400" /> {pt} premium lessons</div>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={26} className="text-green-600" />
                  </div>
                  <p className="font-bold text-gray-900 mb-1">You're enrolled!</p>
                  <p className="text-xs text-gray-500 mb-4">Full access to all lessons</p>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {showVideoPlayer && currentVideo && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => { setShowVideoPlayer(false); setCurrentVideo(null); }}
        >
          <div className="w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 bg-gray-900">
              <p className="text-sm font-medium text-white truncate">{currentVideo.title}</p>
              <button
                onClick={() => { setShowVideoPlayer(false); setCurrentVideo(null); }}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {currentVideo.type === 'youtube' ? (
              <iframe
                className="w-full aspect-video"
                src={currentVideo.url}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video key={currentVideo.url} controls autoPlay className="w-full max-h-[75vh]">
                <source src={currentVideo.url} type="video/mp4" />
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;