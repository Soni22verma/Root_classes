import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useStudentStore from '../../../Store/studentstore';
import api from '../../../services/endpoints';

const ClassroomCourses = () => {
  const navigate = useNavigate();
  const { student } = useStudentStore();  
  const studentId = student?._id;
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [fetchingEnrolled, setFetchingEnrolled] = useState(false);

  const GetFullCourse = async() => {
    try {
      setLoading(true);
      const res = await axios.get(api.fullcourse.getfullcourse);
      
      let coursesData = [];
      if (res.data?.success && res.data?.data?.data) {
        coursesData = res.data.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        coursesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        coursesData = res.data;
      } else if (res.data?.courses && Array.isArray(res.data.courses)) {
        coursesData = res.data.courses;
      }
      
      setCourses(coursesData);
      
      const uniqueCategories = [...new Set(coursesData.map(course => course.category?.name || 'Uncategorized'))];
      setCategories(['All', ...uniqueCategories]);
      
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

 

  useEffect(() => {
    GetFullCourse();
   
  }, [studentId]);

  const isAlreadyEnrolled = (courseId) => {
    return enrolledCourses.includes(courseId);
  };

  const handleViewDetails = (course) => {
    navigate(`/coursedetails`, { state: { course } });
  };

  const filteredCourses = selectedCategory === "All" 
    ? courses 
    : courses.filter(course => (course.category?.name || 'Uncategorized') === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow p-8">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={GetFullCourse} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">Browse and explore available courses</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredCourses.map((course) => {
              const enrolled = isAlreadyEnrolled(course._id);
              
              return (
                <div
                  key={course._id}
                  className={`bg-white rounded-lg border ${enrolled ? 'border-green-300' : 'border-gray-200'} overflow-hidden hover:shadow-md transition-shadow`}
                >
                  {/* Course Cover */}
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white opacity-80">
                      {course.title?.charAt(0) || 'C'}
                    </span>
                  </div>

                  {/* Course Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {course.category?.name || 'General'}
                      </span>
                      {enrolled && (
                        <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                          Enrolled
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {course.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{course.modules?.length || 0} modules</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>

                    {/* Single smaller View Details button */}
                    <button
                      onClick={() => handleViewDetails(course)}
                      className="w-full px-3 py-1.5 text-center text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-6">
            <p className="text-gray-500">
              {selectedCategory !== "All" 
                ? `No courses in ${selectedCategory} category` 
                : 'No courses available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomCourses;