import React, { useState }  from 'react';
import { onlinecourses } from '../components/Constants/Constants';


const OnlineCourses = () => {
  

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["All", "Web Development", "Programming", "Design", "Backend", "Data Science", "CSS", "Full Stack"];

  const filteredCourses = onlinecourses?.filter(onlinecourses => {
    const matchesCategory = selectedCategory === "All" || onlinecourses.category === selectedCategory;
    const matchesSearch = onlinecourses.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         onlinecourses.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleWatchClick = (onlinecourses) => {
    setSelectedCourse(onlinecourses);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  // Helper function to render stars
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`star-${i}`} className="text-yellow-400">★</span>);
    }
    const emptyStars = 5 - fullStars;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header Section */}
      <div className=" text-gray-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold mb-4 animate-fade-in">
              🎓 Online Learning Hub
            </h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Learn from the best instructors with free YouTube courses. Watch anytime, anywhere!
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="🔍 Search courses or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories?.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 text-sm ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses?.map((onlinecourses) => (
            <div
              key={onlinecourses.id}
              className="bg-white rounded-xl overflow-hidden  hover:shadow-sm "
            >
              {/* Thumbnail with play button overlay */}
              <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => handleWatchClick(onlinecourses)}>
                <img
                  src={onlinecourses.thumbnail}
                  alt={onlinecourses.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x225?text=Course+Thumbnail";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                  <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 ">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    onlinecourses.level === "Beginner" ? "bg-green-500" :
                    onlinecourses.level === "Intermediate" ? "bg-yellow-500" : "bg-red-500"
                  } text-white`}>
                    {onlinecourses.level}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                {/* Category Badge */}
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">
                    {onlinecourses.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                  {onlinecourses.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {onlinecourses.description}
                </p>

                {/* Instructor */}
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {onlinecourses.instructor.charAt(0)}
                  </div>
                  <div className="ml-2">
                    <p className="text-gray-700 text-sm font-medium">{onlinecourses.instructor}</p>
                    <p className="text-gray-500 text-xs">{onlinecourses.duration}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {renderStars(onlinecourses.rating)}
                    <span className="ml-1 text-gray-600 text-sm">{onlinecourses.rating}</span>
                  </div>
                  <div className="text-gray-500 text-xs">
                    👥 {onlinecourses.students.toLocaleString()}
                  </div>
                </div>

                {/* Watch Button */}
                <button
                  onClick={() => handleWatchClick(onlinecourses)}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:shadow-sm transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses?.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* YouTube Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] ">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
              <h3 className="text-xl font-bold text-white">{selectedCourse.title}</h3>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Player */}
            <div className="relative pt-[56.25%] bg-black">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={selectedCourse.youtubeUrl}
                title={selectedCourse.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Course Info */}
            <div className="p-6 overflow-y-auto max-h-[30vh]">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">
                  {selectedCourse.category}
                </span>
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                  selectedCourse.level === "Beginner" ? "bg-green-100 text-green-700" :
                  selectedCourse.level === "Intermediate" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                }`}>
                  {selectedCourse.level}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                  ⏱️ {selectedCourse.duration}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                  👥 {selectedCourse.students.toLocaleString()} students
                </span>
              </div>
              
              <p className="text-gray-700 mb-3">{selectedCourse.description}</p>
              
              <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {selectedCourse.instructor.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selectedCourse.instructor}</p>
                  <div className="flex items-center">
                    {renderStars(selectedCourse.rating)}
                    <span className="ml-1 text-gray-600 text-sm">{selectedCourse.rating} rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OnlineCourses;