import React from 'react';

const ProgramCard = ({ title, icon, bgColor, courses, buttonText, buttonLink }) => {
  return (
    <div className={`relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group`}>
      {/* Gradient Background Overlay */}
      <div className={`absolute top-0 left-0 w-full h-2 ${bgColor}`}></div>
      
      {/* Card Content */}
      <div className="p-8">
        {/* Icon and Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${bgColor} bg-opacity-10`}>
            {icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
        
        {/* Course List */}
        <div className="space-y-4 mb-8">
          {courses.map((course, idx) => (
            <div key={idx} className="flex items-start gap-3 group/item">
              <div className={`mt-1 w-1.5 h-1.5 rounded-full ${bgColor.replace('bg-', 'bg-')} flex-shrink-0 mt-2`}></div>
              <p className="text-gray-600 text-sm leading-relaxed">{course}</p>
            </div>
          ))}
        </div>
        
        {/* Button */}
        <button className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ${bgColor} text-white`}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

const ProgramPage = () => {
  // Course data
  const foundationCourses = [
    "One year integrated Course with class 10th for board | NEET | IIT-JEE",
    "Two year integrated course with class 10th for board | NEET | IIT-JEE"
  ];

  const medicalCourses = [
    "One year integrated program class 12th",
    "Two year integrated program class-room 11th & 12th",
    "One year class-room course for Dropper for NEET"
  ];

  const engineeringCourses = [
    "One year integrated program class 12th",
    "Two year integrated program class-room 11th & 12th",
    "One year class-room course for Dropper for IIT-JEE"
  ];

  // Icons
  const foundationIcon = (
    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );

  const medicalIcon = (
    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );

  const engineeringIcon = (
    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <div className="inline-block">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-2xl opacity-20 rounded-full"></div>
            <h1 className="relative text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Join Our Digital Program
            </h1>
          </div>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Distance Learning Platform • Online Classes • Expert Faculty
        </p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Foundation Card */}
        <div className="group">
          <div className="relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            
            {/* Decorative Element */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
            
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                  {foundationIcon}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Foundation</h2>
              </div>
              
              <div className="space-y-4 mb-8">
                {foundationCourses.map((course, idx) => (
                  <div key={idx} className="flex items-start gap-3 group/item">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-2"></div>
                    <p className="text-gray-600 text-sm leading-relaxed">{course}</p>
                  </div>
                ))}
              </div>
              
              <button className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                Join Now →
              </button>
            </div>
          </div>
        </div>

        {/* Medical Card */}
        <div className="group">
          <div className="relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
            
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
            
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-green-50 group-hover:bg-green-100 transition-colors duration-300">
                  {medicalIcon}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Medical</h2>
              </div>
              
              <div className="space-y-4 mb-8">
                {medicalCourses.map((course, idx) => (
                  <div key={idx} className="flex items-start gap-3 group/item">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 mt-2"></div>
                    <p className="text-gray-600 text-sm leading-relaxed">{course}</p>
                  </div>
                ))}
              </div>
              
              <button className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                Enroll Now →
              </button>
            </div>
          </div>
        </div>

        {/* Engineering Card */}
        <div className="group">
          <div className="relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
            
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors duration-300">
                  {engineeringIcon}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Engineering</h2>
              </div>
              
              <div className="space-y-4 mb-8">
                {engineeringCourses.map((course, idx) => (
                  <div key={idx} className="flex items-start gap-3 group/item">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 mt-2"></div>
                    <p className="text-gray-600 text-sm leading-relaxed">{course}</p>
                  </div>
                ))}
              </div>
              
              <button className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                Start Learning →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Features Section */}
      <div className="max-w-7xl mx-auto mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center group">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Expert Faculty</h3>
            <p className="text-gray-600 text-sm">Learn from India's top educators with years of experience</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center group">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-300">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Live Classes</h3>
            <p className="text-gray-600 text-sm">Interactive online classes with doubt clearing sessions</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center group">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors duration-300">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">24/7 Support</h3>
            <p className="text-gray-600 text-sm">Round the clock assistance for all your academic needs</p>
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default ProgramPage;