import React from 'react';
import { facultyMembers } from '../Constants/Constants';

const FacultyShowcase = () => {
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-2xl opacity-20 rounded-full"></div>
          <h1 className="relative text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Our Expert Faculty
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Learn from the best educators in the country. Our faculty brings years of experience and proven teaching methodologies.
        </p>
        
       
      </div>

      {/* Faculty Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {facultyMembers.map((faculty, index) => (
          <div 
            key={faculty.id}
            className="group relative transform transition-all duration-500 hover:-translate-y-2"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Card Glow Effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${faculty.color} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500`}></div>
            
            {/* Main Card */}
            <div className="relative bg-white rounded-2xl shadow-sm transition-all duration-300 overflow-hidden">
              {/* Top Gradient Bar */}
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${faculty.color}`}></div>
              
              <div className="p-6">
                {/* Profile Image and Basic Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-r ${faculty.color} rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <img 
                      src={faculty.image} 
                      alt={faculty.name}
                      className="relative w-20 h-20 rounded-full object-cover border-3 border-white shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Online Status Badge */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:${faculty.color} group-hover:bg-clip-text transition-all duration-300">
                      {faculty.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r ${faculty.color} text-white`}>
                        {faculty.subject}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expertise Description */}
                <div className="mb-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {faculty.expertise}
                  </p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-t border-b border-gray-100">
                  cffffff
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      
                      <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300">
                    View Profile
                  </button>
                  <button className={`flex-1 py-2 text-sm font-medium text-white bg-gradient-to-r ${faculty.color} rounded-xl `}>
                    Book Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default FacultyShowcase;