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

  // Extensive collection of diverse dummy images for different course types
  const getRandomImageForCourse = (courseId, courseTitle, category) => {
    const imageSets = {
      programming: [
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=500&h=250&fit=crop',
      ],
      business: [
        'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1552581234-26160f608093?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&h=250&fit=crop',
      ],
      design: [
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&h=250&fit=crop',
      ],
      data: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&h=250&fit=crop',
      ],
      marketing: [
        'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=500&h=250&fit=crop',
      ],
      development: [
        'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1523800503107-5bc3ba2a6f81?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1534665482403-a909d0d97c67?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1522252234503-e356532cafd5?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=500&h=250&fit=crop',
      ],
      default: [
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=250&fit=crop',
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&h=250&fit=crop',
      ]
    };

    let imageCategory = 'default';
    const categoryName = (category || '').toLowerCase();
    const titleName = (courseTitle || '').toLowerCase();
    
    if (categoryName.includes('program') || categoryName.includes('coding') || titleName.includes('program') || titleName.includes('code')) {
      imageCategory = 'programming';
    } else if (categoryName.includes('business') || titleName.includes('business') || titleName.includes('entrepreneur')) {
      imageCategory = 'business';
    } else if (categoryName.includes('design') || titleName.includes('design') || titleName.includes('creative')) {
      imageCategory = 'design';
    } else if (categoryName.includes('data') || titleName.includes('ai') || titleName.includes('machine learning')) {
      imageCategory = 'data';
    } else if (categoryName.includes('market') || titleName.includes('social media')) {
      imageCategory = 'marketing';
    } else if (categoryName.includes('develop') || titleName.includes('web') || titleName.includes('app')) {
      imageCategory = 'development';
    }

    const images = imageSets[imageCategory];
    const hash = parseInt(courseId?.toString().slice(-4) || '0', 16) || courseId?.length || 0;
    return images[hash % images.length];
  };

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

  const fetchEnrolledCourses = async () => {
    if (!studentId) return;

    try {
      const res = await axios.get(`${api.student.getStudentProfile}/${studentId}`);
      if (res.data?.success && res.data?.data) {
        const studentData = res.data.data;
        setEnrolledCourses(studentData.enrolledCourses || []);
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    }
  };

  const hasPaidContent = (course) => {
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

  // Check if course is free (price is 0 AND no paid content)
  const isFreeCourse = (course) => {
    return (!course.price || course.price === 0) && !hasPaidContent(course);
  };

  // Check if course is paid (price > 0 OR has paid content)
  const isPaidCourse = (course) => {
    return (course.price && course.price > 0) || hasPaidContent(course);
  };

  const getCoursePriceDisplay = (course) => {
    if (!course) return 'Free';
    
    if (course.price && course.price > 0) {
      return `₹${course.price.toLocaleString('en-IN')}`;
    }
    
    if (hasPaidContent(course)) {
      return 'Premium';
    }
    
    return 'Free';
  };

  useEffect(() => {
    GetFullCourse();
  }, []);

  useEffect(() => {
    if (studentId) {
      fetchEnrolledCourses();
    }
  }, [studentId]);

  const isAlreadyEnrolled = (courseId) => {
    return enrolledCourses.includes(courseId);
  };

  const handleViewDetails = (course) => {
    // Pass the course data to CourseDetails page
    navigate(`/coursedetails`, { state: { course } });
  };

  const filteredCourses = selectedCategory === "All" 
    ? courses 
    : courses.filter(course => (course.category?.name || 'Uncategorized') === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-gray-900 mb-4 font-medium">{error}</div>
          <button 
            onClick={GetFullCourse} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with gradient */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Explore Courses
          </h1>
          <p className="text-gray-600 mt-2">Discover and master new skills with our premium courses</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 pb-6 border-b border-gray-200">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 text-sm font-medium transition-all duration-200 rounded-full ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {filteredCourses.map((course) => {
              const enrolled = isAlreadyEnrolled(course._id);
              const priceDisplay = getCoursePriceDisplay(course);
              const courseImage = getRandomImageForCourse(course._id, course.title, course.category?.name);
              const isFree = isFreeCourse(course);
              const isPaid = isPaidCourse(course);
              
              return (
                <div
                  key={course._id}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Course Cover with Unique Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={courseImage}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=250&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Price Badge - Only show for paid courses */}
                    {!enrolled && isPaid && course.price > 0 && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                        ₹{course.price}
                      </div>
                    )}
                    
                    {!enrolled && isPaid && (!course.price || course.price === 0) && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                        Premium
                      </div>
                    )}
                    
                    {/* Free Badge for free courses */}
                    {!enrolled && isFree && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                        Free
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg">
                        {course.category?.name || 'General'}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        enrolled ? 'bg-green-100 text-green-700' : 
                        isFree ? 'bg-green-100 text-green-700' : 
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {enrolled ? 'Enrolled' : (isFree ? 'Free Course' : 'Premium Course')}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {course.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-5 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>{course.modules?.length || 0} modules</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>
                          {course.modules?.reduce((total, module) => 
                            total + (module.chapters?.reduce((chapTotal, chapter) => 
                              chapTotal + (chapter.topics?.length || 0), 0) || 0), 0) || 0} topics
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-gray-900">
                        {priceDisplay}
                      </span>
                    </div>

                    {/* View Details Button - Same for both free and paid courses */}
                    <button
                      onClick={() => handleViewDetails(course)}
                      className="w-full px-4 py-2.5 text-center text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg"
                    >
                      {enrolled ? 'Continue Learning →' : 'View Details →'}
                    </button>

                    {/* Additional Info */}
                    {!enrolled && isPaid && (
                      <p className="text-xs text-gray-400 text-center mt-3">
                        💳 Secure payment gateway
                      </p>
                    )}

                    {!enrolled && isFree && (
                      <p className="text-xs text-green-600 text-center mt-3">
                        🎓 Completely free - Start learning today!
                      </p>
                    )}

                    {!studentId && (
                      <p className="text-xs text-gray-400 text-center mt-3">
                        🔐 Login required to enroll
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 mt-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 mt-4">
              {selectedCategory !== "All" 
                ? `No courses available in ${selectedCategory} category` 
                : 'No courses available at the moment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomCourses;