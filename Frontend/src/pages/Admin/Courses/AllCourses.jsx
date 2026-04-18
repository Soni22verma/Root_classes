import axios from 'axios';
import React, { useEffect, useState } from 'react';
import api from '../../../services/adminendpoint';

const AllCourses = () => {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [expandedModules, setExpandedModules] = useState({});
    const [expandedChapters, setExpandedChapters] = useState({});

    const GetFullDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(api.fullcourse.getfullcourse);
            console.log("API Response:", res);
            
            if (res.data?.success && res.data?.data) {
                const coursesData = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
                setCourses(coursesData);
            } else if (Array.isArray(res.data)) {
                setCourses(res.data);
            } else {
                setCourses([]);
            }
        } catch (error) {
            console.log(error);
            setError(error.response?.data?.message || 'Failed to fetch course details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetFullDetails();
    }, []);

    const handleViewDetails = (course) => {
        setSelectedCourse(course);
        setShowModal(true);
        setExpandedModules({});
        setExpandedChapters({});
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCourse(null);
    };

    const toggleModule = (moduleId) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    const toggleChapter = (chapterId) => {
        setExpandedChapters(prev => ({
            ...prev,
            [chapterId]: !prev[chapterId]
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-4 py-6 sm:py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
                    <strong>Error:</strong> {error}
                    <button 
                        onClick={GetFullDetails}
                        className="ml-3 sm:ml-4 bg-red-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded hover:bg-red-700 transition text-sm"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
            <div className="px-3 sm:px-4 md:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-5 sm:mb-6 md:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Course Management</h1>
                    <p className="text-sm sm:text-base text-gray-600">Manage and view all available courses</p>
                </div>

                {/* Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{courses.length}</div>
                        <div className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">Total Courses</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">
                            {courses.reduce((sum, course) => sum + (course.modules?.length || 0), 0)}
                        </div>
                        <div className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">Total Modules</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">
                            {courses.reduce((sum, course) => 
                                sum + (course.modules?.reduce((s, m) => s + (m.chapters?.length || 0), 0) || 0), 0)}
                        </div>
                        <div className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">Total Chapters</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600">
                            {courses.reduce((sum, course) => 
                                sum + (course.modules?.reduce((s, m) => 
                                    s + (m.chapters?.reduce((t, c) => t + (c.topics?.length || 0), 0) || 0), 0) || 0), 0)}
                        </div>
                        <div className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">Total Topics</div>
                    </div>
                </div>

                {/* Mobile Card View - For screens below 768px */}
                <div className="block md:hidden space-y-3 sm:space-y-4">
                    {courses.map((course) => (
                        <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-3 sm:p-4">
                                <div className="mb-2">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">{course.title}</h3>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                                </div>
                                
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                                    <span className="px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                        {course.category?.name || 'N/A'}
                                    </span>
                                    <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs capitalize ${
                                        course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                                        course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {course.level}
                                    </span>
                                    <span className="px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                        {course.modules?.length || 0} modules
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                    <span className="text-xs text-gray-400">
                                        {new Date(course.createdAt).toLocaleDateString()}
                                    </span>
                                    <button
                                        onClick={() => handleViewDetails(course)}
                                        className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View - For screens 768px and above */}
                <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-800 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold">Course Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold">Level</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold">Modules</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold">Created Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {courses.map((course) => (
                                    <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="font-semibold text-gray-800">{course.title}</div>
                                                <div className="text-xs text-gray-500 mt-1 max-w-md truncate">{course.description}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                {course.category?.name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                                                course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                                                course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {course.level}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-sm">{course.modules?.length || 0} modules</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {new Date(course.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleViewDetails(course)}
                                                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal for Course Details - Responsive */}
                {showModal && selectedCourse && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
                        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                            {/* Modal Header - Responsive */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 sticky top-0 z-10">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 break-words">{selectedCourse.title}</h2>
                                        <p className="text-blue-100 text-xs sm:text-sm line-clamp-2">{selectedCourse.description}</p>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500 rounded-full text-xs sm:text-sm">
                                                {selectedCourse.category?.name || 'Uncategorized'}
                                            </span>
                                            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold ${
                                                selectedCourse.level === 'beginner' ? 'bg-green-500' :
                                                selectedCourse.level === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}>
                                                {selectedCourse.level}
                                            </span>
                                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500 rounded-full text-xs sm:text-sm">
                                                {selectedCourse.modules?.length || 0} Modules
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
                                    >
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body - Responsive */}
                            <div className="p-3 sm:p-4 md:p-6">
                                {selectedCourse.modules && selectedCourse.modules.length > 0 ? (
                                    <div className="space-y-3 sm:space-y-4">
                                        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">Course Modules</h3>
                                        {selectedCourse.modules.map((module, moduleIndex) => (
                                            <div key={module._id} className="border border-gray-200 rounded-lg overflow-hidden">
                                                {/* Module Header */}
                                                <div 
                                                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                                                    onClick={() => toggleModule(module._id)}
                                                >
                                                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm flex-shrink-0">
                                                            {moduleIndex + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base break-words">{module.title}</h4>
                                                            <p className="text-xs text-gray-500">
                                                                {module.chapters?.length || 0} chapters
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button className="text-gray-600 hover:text-gray-800 flex-shrink-0 ml-2">
                                                        <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${expandedModules[module._id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Module Chapters */}
                                                {expandedModules[module._id] && module.chapters && (
                                                    <div className="border-t border-gray-200">
                                                        {module.chapters.map((chapter, chapterIndex) => (
                                                            <div key={chapter._id} className="border-b border-gray-200 last:border-b-0">
                                                                {/* Chapter Header */}
                                                                <div 
                                                                    className="flex items-center justify-between p-3 sm:p-4 pl-8 sm:pl-12 cursor-pointer hover:bg-gray-50"
                                                                    onClick={() => toggleChapter(chapter._id)}
                                                                >
                                                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
                                                                        <span className="text-gray-500 font-medium text-xs sm:text-sm">Ch {chapterIndex + 1}</span>
                                                                        <span className="text-gray-800 text-sm sm:text-base break-words flex-1">{chapter.title}</span>
                                                                        <span className="text-xs text-gray-400 flex-shrink-0">
                                                                            {chapter.topics?.length || 0} topics
                                                                        </span>
                                                                    </div>
                                                                    <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${expandedChapters[chapter._id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </div>

                                                                {/* Chapter Topics */}
                                                                {expandedChapters[chapter._id] && chapter.topics && (
                                                                    <div className="pl-8 sm:pl-12 pr-3 sm:pr-4 pb-3 sm:pb-4 space-y-2 sm:space-y-3">
                                                                        {chapter.topics.map((topic, topicIndex) => (
                                                                            <div key={topic._id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                                                                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                                                                                            <span className="text-blue-600 font-medium text-xs sm:text-sm">Topic {topicIndex + 1}</span>
                                                                                            <h5 className="font-semibold text-gray-800 text-sm sm:text-base break-words">{topic.title}</h5>
                                                                                            {topic.isPreviewFree && (
                                                                                                <span className="px-1.5 sm:px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Free</span>
                                                                                            )}
                                                                                        </div>
                                                                                        
                                                                                        {topic.description && (
                                                                                            <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">{topic.description}</p>
                                                                                        )}
                                                                                        
                                                                                        <div className="flex flex-wrap gap-2 sm:gap-3">
                                                                                            {topic.videoUrl && (
                                                                                                <a 
                                                                                                    href={topic.videoUrl} 
                                                                                                    target="_blank" 
                                                                                                    rel="noopener noreferrer" 
                                                                                                    className="inline-flex items-center gap-1 sm:gap-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                                                                                                >
                                                                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                                    </svg>
                                                                                                    <span>Watch</span>
                                                                                                </a>
                                                                                            )}
                                                                                            
                                                                                            {topic.notes && (
                                                                                                <a 
                                                                                                    href={topic.notes} 
                                                                                                    target="_blank" 
                                                                                                    rel="noopener noreferrer" 
                                                                                                    className="inline-flex items-center gap-1 sm:gap-2 text-green-600 hover:text-green-700 text-xs sm:text-sm"
                                                                                                >
                                                                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                                    </svg>
                                                                                                    <span>Notes</span>
                                                                                                </a>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
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
                                    <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                                        No modules available for this course
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer - Responsive */}
                            <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50 sticky bottom-0">
                                <button
                                    onClick={closeModal}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllCourses;