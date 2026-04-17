import axios from 'axios';
import React, { useState, useMemo, useEffect } from 'react';
import api from '../../services/endpoints';
import useStudentStore from '../../Store/studentstore';

// YouTube URL to Embed URL converter utility
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*[?&]v=([^&]+)/
  ];
  
  let videoId = null;
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }
  
  if (videoId) {
    videoId = videoId.split('?')[0].split('&')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&showinfo=0`;
  }
  
  return url;
};

// Dummy image generator using Unsplash random images
const getDummyImage = (title, index) => {
  const categories = [
    'technology',
    'programming', 
    'computer',
    'coding',
    'development',
    'software',
    'web-design',
    'data-science',
    'artificial-intelligence',
    'machine-learning'
  ];
  
  const category = categories[index % categories.length];
  return `https://source.unsplash.com/featured/400x240?${category}&sig=${index}`;
};

// Dummy image for sidebar course header
const getSidebarDummyImage = (title, index) => {
  const categories = [
    'education',
    'learning',
    'study',
    'knowledge',
    'academy'
  ];
  
  const category = categories[index % categories.length];
  return `https://source.unsplash.com/featured/800x400?${category}&sig=${index}`;
};

const PurchasedCourse = () => {
    const { student } = useStudentStore();
    const studentId = student?.id || student?._id;
    
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [expandedModuleId, setExpandedModuleId] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [videoCompleted, setVideoCompleted] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [embedUrl, setEmbedUrl] = useState(null);

    useEffect(() => {
        if (selectedTopic?.videoUrl && selectedTopic?.videoType === 'youtube') {
            const embed = getYouTubeEmbedUrl(selectedTopic.videoUrl);
            setEmbedUrl(embed);
        } else {
            setEmbedUrl(selectedTopic?.videoUrl || null);
        }
    }, [selectedTopic]);

    const handlePurchasedCourses = async () => {
        if (!studentId) {
            console.log("Student ID not available yet");
            setError("Student information not loaded");
            return;
        }

        try {
            setLoading(true);
            console.log("Fetching purchased courses for studentId:", studentId);
            
            const res = await axios.post(api.payment.getPurchesCourse, {
                studentId: studentId
            });
            
            console.log("API Response:", res);
            
            if (res.data && res.data.success && res.data.data) {
                setCourses(res.data.data);
            }
            
        } catch (error) {
            console.error("Error fetching purchased courses:", error);
            setError(error.response?.data?.message || error.message || "Failed to fetch courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (studentId) {
            handlePurchasedCourses();
        } else {
            console.log("Waiting for student data to load...");
        }
    }, [studentId]);

    const totalTopics = useMemo(() => {
        if (!selectedCourse?.course?.modules) return 0;
        let count = 0;
        selectedCourse.course.modules.forEach(module => {
            module.chapters?.forEach(chapter => {
                count += chapter.topics?.length || 0;
            });
        });
        return count;
    }, [selectedCourse]);

    const completedTopicsCount = useMemo(() => {
        return Object.keys(videoCompleted).filter(id => videoCompleted[id]).length;
    }, [videoCompleted]);

    const progressPercentage = totalTopics > 0 ? (completedTopicsCount / totalTopics) * 100 : 0;

    const handleModuleClick = (moduleId) => {
        setExpandedModuleId(expandedModuleId === moduleId ? null : moduleId);
    };

    const handleTopicClick = (topic) => {
        setSelectedTopic(topic);
    };

    const handleVideoComplete = (topicId) => {
        setVideoCompleted(prev => ({
            ...prev,
            [topicId]: true
        }));
    };

    const getAllTopics = () => {
        if (!selectedCourse?.course?.modules) return [];
        const topics = [];
        selectedCourse.course.modules.forEach(module => {
            module.chapters?.forEach(chapter => {
                chapter.topics?.forEach(topic => {
                    topics.push({
                        ...topic,
                        moduleId: module.id,
                        moduleTitle: module.title,
                        chapterTitle: chapter.title
                    });
                });
            });
        });
        return topics;
    };

    const allTopics = getAllTopics();
    const currentTopicIndex = selectedTopic ? allTopics.findIndex(t => t._id === selectedTopic._id) : -1;
    const nextTopic = currentTopicIndex >= 0 && currentTopicIndex < allTopics.length - 1 ? allTopics[currentTopicIndex + 1] : null;
    const prevTopic = currentTopicIndex > 0 ? allTopics[currentTopicIndex - 1] : null;

    const handleNextTopic = () => {
        if (nextTopic) {
            handleTopicClick(nextTopic);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevTopic = () => {
        if (prevTopic) {
            handleTopicClick(prevTopic);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleCourseSelect = (courseItem) => {
        setSelectedCourse(courseItem);
        setSelectedTopic(null);
        setExpandedModuleId(courseItem.course.modules[0]?.id || null);
        setVideoCompleted({});
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your courses...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                        <p>Error: {error}</p>
                        <button 
                            onClick={handlePurchasedCourses}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-5">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700">No Courses Found</h2>
                    <p className="text-gray-400 mt-2">
                        You haven't purchased any courses yet.
                    </p>
                </div>
            </div>
        );
    }

    // If no course is selected, show only course cards
    if (!selectedCourse) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header Section */}
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                            My Learning Journey
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Continue your learning from where you left off
                        </p>
                        <div className="w-20 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
                    </div>
                    
                    {/* Course Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((courseItem, index) => {
                            const totalCourseTopics = courseItem.course.modules?.reduce((acc, module) => 
                                acc + (module.chapters?.reduce((acc2, chapter) => 
                                    acc2 + (chapter.topics?.length || 0), 0) || 0), 0);
                            
                            return (
                                <div
                                    key={courseItem.course._id}
                                    onClick={() => handleCourseSelect(courseItem)}
                                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                                >
                                    {/* Course Image with Dummy Image */}
                                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                                        {courseItem.course.image ? (
                                            <>
                                                <img
                                                    src={courseItem.course.image}
                                                    alt={courseItem.course.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="text-center text-white p-4">
                                                        <svg className="w-16 h-16 mx-auto mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                        </svg>
                                                        <p className="text-sm font-medium">{courseItem.course.title}</p>
                                                    </div>
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                            </>
                                        )}
                                        
                                        {/* Level Badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium">
                                                {courseItem.course.level || "Beginner"}
                                            </span>
                                        </div>
                                        
                                        {/* Price Badge (if any) */}
                                        {courseItem.price && (
                                            <div className="absolute top-4 right-4">
                                                <span className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                                                    ${courseItem.price}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Course Content */}
                                    <div className="p-6">
                                        {/* Category */}
                                        {courseItem.course.category?.name && (
                                            <div className="mb-2">
                                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                    {courseItem.course.category.name}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {courseItem.course.title}
                                        </h3>
                                        
                                        {/* Description */}
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {courseItem.course.description || "No description available"}
                                        </p>
                                        
                                        {/* Course Stats */}
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                                <span className="font-medium">{courseItem.course.modules?.length || 0} Modules</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                <span className="font-medium">{totalCourseTopics} Topics</span>
                                            </div>
                                        </div>
                                        
                                        {/* Instructor Info */}
                                        {courseItem.course.instructor && (
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <span className="text-xs text-gray-500">By {courseItem.course.instructor}</span>
                                            </div>
                                        )}
                                        
                                        {/* View Course Button */}
                                        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform group-hover:shadow-lg">
                                            <span className="flex items-center justify-center gap-2">
                                                Continue Learning
                                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back to Courses Button */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
                <div className="max-w-full mx-auto">
                    <button
                        onClick={() => {
                            setSelectedCourse(null);
                            setSelectedTopic(null);
                        }}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to All Courses
                    </button>
                </div>
            </div>
            
            <div className="flex flex-col lg:flex-row">
                {/* Sidebar - Left with reduced width */}
                <aside className="w-full lg:w-72 bg-white border-r border-gray-200 shadow-sm overflow-y-auto h-screen sticky top-0">
                    <div className="p-3">
                        {/* Course Header with Progress and Dummy Image */}
                        <div className="mb-4">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg overflow-hidden">
                                {/* Sidebar Dummy Image */}
                                <div className="relative h-32 overflow-hidden">
                                    {selectedCourse.course.image ? (
                                        <img
                                            src={selectedCourse.course.image}
                                            alt={selectedCourse.course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                            <div className="text-center text-white p-3">
                                                <svg className="w-10 h-10 mx-auto mb-1 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                                <p className="text-xs font-medium">{selectedCourse.course.title}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                </div>
                                
                                <div className="p-3 text-white">
                                    <h2 className="text-sm font-bold leading-tight">{selectedCourse.course.title}</h2>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-blue-100">
                                        <span className="bg-white/20 px-2 py-0.5 rounded">{selectedCourse.course.level || "Beginner"}</span>
                                        <span className="bg-white/20 px-2 py-0.5 rounded">{selectedCourse.course.category?.name || "Course"}</span>
                                    </div>
                                    <p className="text-xs text-blue-100 mt-1 opacity-90">
                                        {selectedCourse.course.modules?.length || 0} modules • {totalTopics} topics
                                    </p>
                                    
                                    {/* Progress Bar */}
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs text-blue-100 mb-1">
                                            <span>Progress</span>
                                            <span>{Math.round(progressPercentage)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-green-400 rounded-full transition-all duration-300"
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-2 mb-2">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Course Content</h3>
                        </div>

                        <div className="space-y-2">
                            {selectedCourse.course.modules?.map((module, moduleIdx) => {
                                const moduleTopicsCount = module.chapters?.reduce((acc, chapter) => acc + (chapter.topics?.length || 0), 0) || 0;
                                const moduleCompletedCount = module.chapters?.reduce((acc, chapter) => 
                                    acc + (chapter.topics?.filter(topic => videoCompleted[topic._id]).length || 0), 0) || 0;
                                const moduleProgress = moduleTopicsCount > 0 ? (moduleCompletedCount / moduleTopicsCount) * 100 : 0;
                                
                                return (
                                    <div key={module._id || module.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <button
                                            onClick={() => handleModuleClick(module._id || module.id)}
                                            className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs font-semibold text-gray-700">
                                                            M{moduleIdx + 1}:
                                                        </span>
                                                        <span className="text-xs font-medium text-gray-800 truncate">{module.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-500">{moduleTopicsCount} topics</span>
                                                        <div className="flex-1 max-w-20">
                                                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-blue-500 rounded-full transition-all"
                                                                    style={{ width: `${moduleProgress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-500">{Math.round(moduleProgress)}%</span>
                                                    </div>
                                                </div>
                                                <svg
                                                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                                                        expandedModuleId === (module._id || module.id) ? 'rotate-180' : ''
                                                    }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </button>
                                        
                                        {expandedModuleId === (module._id || module.id) && (
                                            <div className="bg-white border-t border-gray-100">
                                                {module.chapters?.map((chapter, chapterIdx) => (
                                                    <div key={chapter._id || chapter.id} className="border-b border-gray-50 last:border-b-0">
                                                        <div className="px-3 py-1.5 bg-gray-50/50">
                                                            <h4 className="text-xs font-semibold text-gray-500">
                                                                Ch {chapterIdx + 1}: {chapter.title}
                                                            </h4>
                                                        </div>
                                                        <div className="py-0.5">
                                                            {chapter.topics?.map((topic, topicIdx) => (
                                                                <button
                                                                    key={topic._id}
                                                                    onClick={() => handleTopicClick(topic)}
                                                                    className={`w-full text-left px-3 py-2 text-xs transition-all ${
                                                                        selectedTopic?._id === topic._id
                                                                            ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                                                                            : 'hover:bg-gray-50 text-gray-700 hover:pl-4'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                                            <span className="text-xs text-gray-400 flex-shrink-0">
                                                                                {String(topicIdx + 1).padStart(2, '0')}
                                                                            </span>
                                                                            <span className="truncate text-xs">{topic.title}</span>
                                                                        </div>
                                                                        {videoCompleted[topic._id] && (
                                                                            <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area - Reduced gaps */}
                <main className="flex-1 p-3 md:p-4 bg-gray-50 min-h-screen">
                    {selectedTopic ? (
                        <div className="max-w-5xl mx-auto">
                            {/* Video Player Section - Tighter spacing */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-4">
                                <div className="aspect-video bg-black relative">
                                    {selectedTopic.videoType === 'youtube' && embedUrl ? (
                                        <iframe
                                            className="w-full h-full"
                                            src={embedUrl}
                                            title={selectedTopic.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    ) : selectedTopic.videoUrl && selectedTopic.videoType === 'upload' ? (
                                        <video
                                            className="w-full h-full"
                                            src={selectedTopic.videoUrl}
                                            controls
                                            onEnded={() => handleVideoComplete(selectedTopic._id)}
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                            <div className="text-center">
                                                <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-gray-400 text-sm">No video available</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Video Completion Button - Compact */}
                                <div className="p-3 bg-gray-50 border-t border-gray-100">
                                    {!videoCompleted[selectedTopic._id] ? (
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <p className="text-xs text-gray-600">📺 Watch to learn about {selectedTopic.title}</p>
                                            <button
                                                onClick={() => handleVideoComplete(selectedTopic._id)}
                                                className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded transition shadow-sm"
                                            >
                                                Mark Completed
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-green-700">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-xs font-medium">✅ Completed!</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Topic Content Section - Compact */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                {/* Topic Header - Tighter */}
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">Topic</span>
                                        <span>•</span>
                                        <span className="truncate text-xs">{selectedTopic.title}</span>
                                    </div>
                                    <h1 className="text-lg md:text-xl font-bold text-gray-800">{selectedTopic.title}</h1>
                                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{selectedTopic.description || "No description available."}</p>
                                </div>

                                {/* Notes Section - Compact */}
                                {selectedTopic.notesUrl && (
                                    <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            <h2 className="text-base font-semibold text-gray-800">Study Notes</h2>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded border border-gray-200">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                {selectedTopic.notes || "No notes available for this topic."}
                                            </p>
                                        </div>
                                        <div className="mt-3">
                                            <a
                                                href={selectedTopic.notesUrl}
                                                download
                                                className="inline-flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition shadow-sm"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download PDF
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Topic Navigation - Compact */}
                                <div className="p-4 bg-gray-50 border-t border-gray-100">
                                    <div className="flex items-center justify-between gap-2">
                                        <button
                                            onClick={handlePrevTopic}
                                            disabled={!prevTopic}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition ${
                                                prevTopic 
                                                    ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm' 
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Previous
                                        </button>
                                        <span className="text-xs text-gray-500">
                                            {currentTopicIndex + 1} / {allTopics.length}
                                        </span>
                                        <button
                                            onClick={handleNextTopic}
                                            disabled={!nextTopic}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition ${
                                                nextTopic 
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            Next
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <div className="text-center max-w-md">
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold text-gray-700">Select a Topic</h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    Choose from the sidebar to start learning
                                </p>
                            </div>
                        </div>
                    )}  
                </main>
            </div>
        </div>
    );
};

export default PurchasedCourse;