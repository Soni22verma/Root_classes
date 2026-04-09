import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useStudentStore from '../../Store/studentstore';
import api from '../../services/endpoints';

const ClassroomCourses = () => {
  const { student } = useStudentStore();  
  const studentId = student?._id;
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const GetCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(api.course.getcourses);
      console.log("Full API Response:", response);
      
      let coursesData = [];
      
      if (response.data && response.data.success) {
        if (response.data.data && response.data.data.course) {
          coursesData = response.data.data.course;
        } else if (response.data.course) {
          coursesData = response.data.course;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          coursesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          coursesData = response.data;
        }
      }
      
      if (coursesData && coursesData.length > 0) {
        setCourses(coursesData);
        
        const uniqueCategories = ['All', ...new Set(coursesData.map(course => course.level || 'Beginner'))];
        setCategories(uniqueCategories);
        
      } else {
        setCourses([]);
        setError("No courses available at the moment");
      }
      
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Error loading courses. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetCourses();
  }, [studentId]); 

  const isAlreadyEnrolled = (courseId) => {
    return enrolledCourses.includes(courseId);
  };

  const handleEnrollment = async () => {
    if (!studentId) {
      alert("Please login to enroll in courses");
      return;
    }
    
    if (!selectedCourse) {
      alert("No course selected");
      return;
    }
    
    if (isAlreadyEnrolled(selectedCourse._id)) {
      alert("You are already enrolled in this course!");
      closeModal();
      return;
    }
    
    setEnrollmentLoading(true);
    
    try {
      console.log("Enrolling with:", {
        courseId: selectedCourse._id,
        studentId: studentId
      });
      
      const response = await axios.post(api.enrollment.enrollcourse, {
        courseId: selectedCourse._id,
        studentId: studentId
      });
      
      console.log("Enrollment response:", response);
      
      if (response.data.success) {
        setEnrolledCourses(prev => [...prev, selectedCourse._id]);
        alert("Successfully enrolled in the course!");
        closeModal();
      } else {
        alert(response.data.message || "Enrollment failed. Please try again.");
      }
      
    } catch (error) {
      console.error("Enrollment error:", error);
      
      if (error.response?.data?.message === "Student already enrolled in this course") {
        alert("You are already enrolled in this course!");
        setEnrolledCourses(prev => [...prev, selectedCourse._id]);
      } else {
        alert(error.response?.data?.message || "Error enrolling in course. Please try again.");
      }
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleEnrollClick = (course) => {
    if (isAlreadyEnrolled(course._id)) {
      alert("You are already enrolled in this course!");
      return;
    }
    
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedCourse(null);
  };

  const filteredCourses = selectedCategory === "All" 
    ? courses 
    : courses.filter(course => (course.level || 'Beginner') === selectedCategory);

  const renderStars = (rating) => {
    const numRating = parseFloat(rating) || 4.5;
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`star-${i}`} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half-star" className="text-yellow-400">½</span>);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button 
            onClick={GetCourses} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              Classroom Courses
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expand your knowledge with expert-led courses designed for your success
            </p>
            {courses.length > 0 && (
              <p className="text-sm text-gray-500 mt-4">
                Total {courses.length} courses available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {categories.length > 1 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Course Cards Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const enrolled = isAlreadyEnrolled(course._id);
              
              return (
                <div
                  key={course._id || course.id || Math.random()}
                  className={`bg-white rounded-xl overflow-hidden hover:shadow-sm transition-all duration-300 ${
                    enrolled ? 'opacity-75 border-2 border-blue-500' : ''
                  }`}
                >
                  {/* Card Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.thumbnail || 'https://via.placeholder.com/400x200?text=No+Image'}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-blue-600 shadow">
                        {course.level || 'Beginner'}
                      </span>
                    </div>
                    {enrolled && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold shadow">
                          ✓ Enrolled
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {course.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                      {course.title || 'Untitled Course'}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.discreption || course.description || 'No description available'}
                    </p>

                    {/* Instructor */}
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {course.instructor?.charAt(0) || '?'}
                      </div>
                      <span className="ml-2 text-gray-700 text-sm font-medium">
                        {course.instructor || 'Unknown Instructor'}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        {renderStars(course.rating)}
                        <span className="ml-1 text-gray-600 text-sm">{course.rating || 4.5}</span>
                      </div>
                      <div className="text-gray-600 text-sm">
                        📚 {course.students?.toLocaleString() || '0'} students
                      </div>
                    </div>

                    {/* Duration and Price Section */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">{course.duration || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-600">${course.price || '0'}</span>
                        <button
                          onClick={() => handleEnrollClick(course)}
                          disabled={enrolled}
                          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 transform ${
                            enrolled 
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                          }`}
                        >
                          {enrolled ? 'Enrolled' : 'Enroll'}
                        </button>
                        <button
                          onClick={() => handleViewDetails(course)}
                          className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No courses found</h3>
            <p className="text-gray-500">
              {selectedCategory !== "All" 
                ? `No courses available in ${selectedCategory} category` 
                : 'No courses available at the moment'}
            </p>
          </div>
        )}
      </div>

      {/* Compact Course Details Modal */}
      {showDetailsModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Course Details</h2>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-5 py-4">
              {/* Course Image */}
              {selectedCourse.thumbnail && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={selectedCourse.thumbnail}
                    alt={selectedCourse.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x400?text=Course+Image';
                    }}
                  />
                </div>
              )}

              {/* Course Title */}
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{selectedCourse.title}</h3>

              {/* Instructor Info - Compact */}
              <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {selectedCourse.instructor?.charAt(0) || '?'}
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">Instructor</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedCourse.instructor || 'Unknown Instructor'}</p>
                </div>
              </div>

              {/* Course Stats Grid - Compact */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="text-lg mb-0.5">⭐</div>
                  <div className="font-semibold text-gray-800 text-sm">{selectedCourse.rating || 4.5}</div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="text-lg mb-0.5">👥</div>
                  <div className="font-semibold text-gray-800 text-sm">{selectedCourse.students?.toLocaleString() || '0'}</div>
                  <div className="text-xs text-gray-600">Students</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <div className="text-lg mb-0.5">⏱️</div>
                  <div className="font-semibold text-gray-800 text-sm">{selectedCourse.duration || 'N/A'}</div>
                  <div className="text-xs text-gray-600">Duration</div>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded-lg">
                  <div className="text-lg mb-0.5">📊</div>
                  <div className="font-semibold text-gray-800 text-sm">{selectedCourse.level || 'Beginner'}</div>
                  <div className="text-xs text-gray-600">Level</div>
                </div>
              </div>

              {/* Price - Compact */}
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
                <div className="text-xs opacity-90">Course Price</div>
                <div className="text-2xl font-bold">${selectedCourse.price || '0'}</div>
              </div>

              {/* Description - Compact */}
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-800 mb-2">Description</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedCourse.discreption || selectedCourse.description || 'No description available'}
                </p>
              </div>

              {/* Tags - Compact */}
              {selectedCourse.tags && selectedCourse.tags.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">Topics</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCourse.tags.slice(0, 5).map((tag, index) => (
                      <span key={index} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {tag}
                      </span>
                    ))}
                    {selectedCourse.tags.length > 5 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{selectedCourse.tags.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer - Compact */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 py-3 flex gap-2">
              <button
                onClick={closeDetailsModal}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeDetailsModal();
                  handleEnrollClick(selectedCourse);
                }}
                disabled={isAlreadyEnrolled(selectedCourse._id)}
                className={`flex-1 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  isAlreadyEnrolled(selectedCourse._id)
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                }`}
              >
                {isAlreadyEnrolled(selectedCourse._id) ? 'Already Enrolled' : 'Enroll Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Confirmation Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Confirm Enrollment</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={enrollmentLoading}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 text-lg mb-2">{selectedCourse.title}</h3>
                <p className="text-sm text-gray-600">Instructor: {selectedCourse.instructor}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Duration: {selectedCourse.duration}</span>
                  <span className="text-lg font-bold text-blue-600">${selectedCourse.price}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700 mb-2">Are you sure you want to enroll in this course?</p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Course will be added to your dashboard</li>
                  <li>• You'll get access to all course materials</li>
                  <li>• Certificate will be provided upon completion</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={enrollmentLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEnrollment}
                disabled={enrollmentLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrollmentLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Enrolling...
                  </div>
                ) : (
                  'Confirm Enrollment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomCourses;