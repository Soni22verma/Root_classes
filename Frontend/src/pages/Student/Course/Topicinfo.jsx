// src/pages/TopicInfo.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Play, FileText, Lock, Unlock, CheckCircle, X, Calendar, Download, GraduationCap, ExternalLink } from 'lucide-react';
import axios from 'axios';
import useStudentStore from '../../../Store/studentstore';
import api from '../../../services/endpoints';

const TopicInfo = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { student } = useStudentStore();
  
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [course, setCourse] = useState(null);

  // Get data from location state or fetch from API
  useEffect(() => {
    if (location.state?.topic) {
      setTopic(location.state.topic);
      setIsEnrolled(location.state?.isEnrolled || false);
      setCourse({ _id: location.state?.courseId, title: location.state?.courseTitle });
      setLoading(false);
    } else if (topicId) {
      fetchTopicDetails();
    } else {
      setError('No topic information available');
      setLoading(false);
    }
  }, [topicId, location.state]);

  // Check enrollment status if we have course ID
  useEffect(() => {
    if (student?._id && course?._id) {
      checkEnrollmentStatus();
    }
  }, [student, course]);

  const fetchTopicDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${api.topics.getTopic}/${topicId}`);
      if (response.data?.success) {
        setTopic(response.data.data);
        // Fetch course info to check enrollment
        if (response.data.data.courseId) {
          const courseRes = await axios.get(`${api.courses.getCourse}/${response.data.data.courseId}`);
          if (courseRes.data?.success) {
            setCourse(courseRes.data.data);
          }
        }
      } else {
        setError('Topic not found');
      }
    } catch (err) {
      console.error('Error fetching topic:', err);
      setError('Failed to load topic information');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!student?._id || !course?._id) return;
    try {
      const res = await axios.get(`${api.student.getStudentProfile}/${student._id}`);
      if (res.data?.success) {
        const enrolled = res.data.data?.enrolledCourses?.includes(course._id);
        setIsEnrolled(!!enrolled);
      }
    } catch (err) {
      console.error('Error checking enrollment:', err);
    }
  };

  const hasAccess = () => {
    return isEnrolled || topic?.isPreviewFree === true;
  };

  const playVideo = () => {
    if (!hasAccess()) return;
    if (!topic.videoUrl) return;
    const isYT = topic.videoUrl.includes('youtube.com') || topic.videoUrl.includes('youtu.be');
    const embedUrl = isYT ? getYouTubeEmbedUrl(topic.videoUrl) : topic.videoUrl;
    window.open(embedUrl, '_blank');
  };

  const openNotes = () => {
    if (!hasAccess()) return;
    window.open(topic.notesUrl, '_blank');
  };

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
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0` : url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading topic information...</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-2xl border border-gray-100 shadow max-w-sm">
          <BookOpen size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="font-semibold text-gray-800 mb-2">{error || 'Topic not found'}</p>
          <p className="text-sm text-gray-500 mb-4">The topic you're looking for doesn't exist or has been moved.</p>
          <button 
            onClick={() => navigate(-1)} 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const accessible = hasAccess();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3"> {/* Changed from max-w-4xl to max-w-7xl, reduced padding */}
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Course
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6"> {/* Changed from max-w-4xl to max-w-7xl, reduced padding */}
        {/* Access Warning */}
        {!accessible && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Lock size={18} className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Premium Content</p>
                <p className="text-sm text-amber-700 mt-1">
                  This topic is part of a premium course. Enroll in the course to access all materials.
                </p>
                {course?._id && (
                  <button
                    onClick={() => navigate(`/course/${course._id}`)}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    View Course
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-5"> {/* Reduced from space-y-6 */}
          {/* Hero Section */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 sm:px-6 py-6 sm:py-8"> {/* Reduced padding on mobile */}
              <div className="flex items-center gap-2 mb-3">
                {topic.isPreviewFree && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                    <Unlock size={12} /> Free Preview
                  </span>
                )}
                {!topic.isPreviewFree && !accessible && (
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                    <Lock size={12} /> Premium Content
                  </span>
                )}
                {accessible && !topic.isPreviewFree && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                    <CheckCircle size={12} /> Access Granted
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{topic.title}</h1> {/* Responsive text */}
              {course && (
                <p className="text-blue-100 text-sm flex items-center gap-2">
                  <GraduationCap size={14} />
                  Part of: {course.title}
                </p>
              )}
            </div>

            {/* Description Section */}
            <div className="p-4 sm:p-6"> {/* Reduced padding on mobile */}
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen size={18} className="text-blue-600" />
                About this lesson
              </h2>
              {topic.description ? (
                <div 
                  className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: topic.description }}
                />
              ) : (
                <p className="text-gray-400 italic">No description available for this lesson.</p>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6"> {/* Reduced padding */}
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              Lesson Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4"> {/* Reduced gap on mobile */}
              {topic.duration && (
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Clock size={14} />
                    <span>Duration</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{topic.duration} minutes</p>
                </div>
              )}
              
              {topic.order && (
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <GraduationCap size={14} />
                    <span>Lesson Order</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">Lesson #{topic.order}</p>
                </div>
              )}

              {topic.createdAt && (
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Calendar size={14} />
                    <span>Added On</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(topic.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Learning Materials */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              Learning Materials
            </h2>
            
            <div className="space-y-3">
              {topic.videoUrl && (
                <button
                  onClick={playVideo}
                  disabled={!accessible}
                  className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl transition-all ${
                    accessible 
                      ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer' 
                      : 'bg-gray-50 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                      accessible ? 'bg-blue-600' : 'bg-gray-400'
                    }`}>
                      <Play size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">Watch Video Lesson</p>
                      <p className="text-xs text-gray-500">Click to play the video</p>
                    </div>
                  </div>
                  <ExternalLink size={16} className={accessible ? 'text-blue-600' : 'text-gray-400'} />
                </button>
              )}

              {topic.notesUrl && (
                <button
                  onClick={openNotes}
                  disabled={!accessible}
                  className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl transition-all ${
                    accessible 
                      ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer' 
                      : 'bg-gray-50 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                      <FileText size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">Download Notes</p>
                      <p className="text-xs text-gray-500">PDF format available</p>
                    </div>
                  </div>
                  <Download size={16} className="text-gray-500" />
                </button>
              )}

              {!topic.videoUrl && !topic.notesUrl && (
                <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl">
                  <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-400 text-sm">No learning materials available for this lesson yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sticky bottom-4">
            <button
              onClick={() => navigate(-1)}
              className="py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicInfo;