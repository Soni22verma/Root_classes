import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCourseStore } from '../../../Store/fullCourseStore';


const AllCourses = () => {
    const {courseId, setCourseId } = useCourseStore();
    const [loading, setLoading] = useState(false);
    const[courses,setCourses] = useState([])
    const [error, setError] = useState(null);
    const [expandedModules, setExpandedModules] = useState({});
    const [expandedChapters, setExpandedChapters] = useState({});


    const handleOpenCourse = (id) => {
  setCourseId(id); 
};
    console.log("Component rendered with courseId:", courseId);

const GetFullDetails = async () => {
  try {
    const res = await axios.post(
      api.fullcourse.getfullcourse,
      { courseId } 
    );

    setCourses([res.data.data]); 

  } catch (error) {
    console.log(error);
  }
};
useEffect(()=>{
    if(courseId){
      GetFullDetails()  
    }
},[courseId])



    // Loading State
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="mt-2">Loading course data...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error:</strong> {error}
                    <button 
                        onClick={() =>handleOpenCourse(courseId)}
                        className="ml-4 bg-blue-500 text-white px-3 py-1 rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

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

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Course Details</h1>
            
            {/* Debug: Show current courseId */}
            <div className="bg-gray-100 p-2 mb-4 rounded text-sm">
                Current Course ID: <strong>{courseId || 'Not available'}</strong>
            </div>
            
            {courses.length === 0 && !loading && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    No course found. Course ID: {courseId || 'Not provided'}
                    {courseId && (
                        <button 
                            onClick={getFullCourse}
                            className="ml-4 bg-blue-500 text-white px-3 py-1 rounded"
                        >
                            Load Course
                        </button>
                    )}
                </div>
            )}
            
            <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold">Course Details</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">Level</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">Modules</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">Created At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {courses.map((course) => (
                            <React.Fragment key={course._id}>
                                {/* Main Course Row */}
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-semibold text-gray-800">{course.title}</div>
                                            <div className="text-sm text-gray-500 mt-1">{course.description}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            {course.category?.name || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                            course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                                            course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {course.level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium">{course.modules?.length || 0} modules</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(course.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>

                                {/* Modules Section */}
                                {course.modules && course.modules.length > 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-0 py-0 bg-gray-50">
                                            <div className="ml-8 my-4">
                                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Modules</h3>
                                                {course.modules.map((module, moduleIndex) => (
                                                    <div key={module._id} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                                                        <div 
                                                            className="flex items-center justify-between p-4 bg-gray-100 cursor-pointer hover:bg-gray-200"
                                                            onClick={() => toggleModule(module._id)}
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <span className="font-bold text-gray-700">Module {moduleIndex + 1}:</span>
                                                                <span className="font-medium text-gray-800">{module.title}</span>
                                                                <span className="text-sm text-gray-500">({module.chapters?.length || 0} chapters)</span>
                                                            </div>
                                                            <span>{expandedModules[module._id] ? '▼' : '▶'}</span>
                                                        </div>
                                                        {expandedModules[module._id] && module.chapters && (
                                                            <div className="p-4 bg-white">
                                                                {module.chapters.map((chapter, chapterIndex) => (
                                                                    <div key={chapter._id} className="mb-3 border border-gray-200 rounded-lg">
                                                                        <div 
                                                                            className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                                                            onClick={() => toggleChapter(chapter._id)}
                                                                        >
                                                                            <div className="flex items-center space-x-3">
                                                                                <span className="font-semibold text-gray-700">Chapter {chapterIndex + 1}:</span>
                                                                                <span className="text-gray-800">{chapter.title}</span>
                                                                                <span className="text-sm text-gray-500">({chapter.topics?.length || 0} topics)</span>
                                                                            </div>
                                                                            <span>{expandedChapters[chapter._id] ? '▼' : '▶'}</span>
                                                                        </div>
                                                                        {expandedChapters[chapter._id] && chapter.topics && (
                                                                            <div className="p-4">
                                                                                {chapter.topics.map((topic, topicIndex) => (
                                                                                    <div key={topic._id} className="border-l-4 border-blue-500 pl-4 mb-4">
                                                                                        <div className="font-medium">{topicIndex + 1}. {topic.title}</div>
                                                                                        {topic.isPreviewFree && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Free Preview</span>}
                                                                                        {topic.description && <p className="text-sm text-gray-600 mt-1">{topic.description}</p>}
                                                                                        {topic.videoUrl && (
                                                                                            <a href={topic.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm block mt-1">
                                                                                                Watch Video
                                                                                            </a>
                                                                                        )}
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
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllCourses;