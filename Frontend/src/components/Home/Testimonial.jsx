import React from 'react';
import { testimonials, youtubeLinks } from '../Constants/Constants';

const TestimonialsPage = () => {
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Hero Section with Decorative Elements */}
      <div className="max-w-7xl mx-auto text-center mb-16 relative">
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        
        <div className="relative">
          <div className="inline-block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-2xl opacity-30 rounded-full"></div>
              <h1 className="relative text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                Testimonials
              </h1>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-4">
            Our Pride & Dedication • Real Stories, Real Success
          </p>
        </div>
      </div>

      {/* Testimonials Grid */}
     <div className="max-w-7xl mx-auto mb-20">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {testimonials.map((testimonial, index) => (
      <div 
        key={testimonial.id}
        className="group relative"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Floating card with new design */}
        <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 overflow-hidden">
          
          {/* Diagonal accent line */}
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${testimonial.bgColor} opacity-10 rounded-bl-full`}></div>
          
          {/* Bottom decorative line */}
          <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${testimonial.bgColor} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
          
          <div className="p-8 relative">
            {/* Quote icon at top right */}
            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
              <svg className="w-12 h-12 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            
            {/* Profile Section - Horizontal layout with larger image */}
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${testimonial.bgColor} rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="relative w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                />
                {/* Verification badge */}
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:${testimonial.bgColor} group-hover:bg-clip-text transition-all duration-300">
                  {testimonial.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{testimonial.achievement}</p>
              </div>
            </div>

            {/* Score and Category combined */}
            <div className="flex items-center justify-between mb-5">
              <div className={`px-3 py-1.5 rounded-xl bg-gradient-to-r ${testimonial.bgColor} text-white text-xs font-bold shadow-md`}>
                🏆 {testimonial.score}
              </div>
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Category Chip */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {testimonial.category}
              </span>
            </div>

            {/* Quote with new styling */}
            <div className="relative mb-6">
              <p className="text-gray-600 text-sm leading-relaxed italic">
                "{testimonial.quote}"
              </p>
            </div>

            {/* Interactive footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors duration-300 flex items-center gap-1 group/btn">
                Read Full Story
                <svg className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors duration-300 cursor-pointer">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors duration-300 cursor-pointer">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 4L15.2 9.6M22 4l-7 10-5-5-6 6M22 4h-6M4 6h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>


      {/* YouTube Links Section */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Success Stories in Action</h2>
          <p className="text-gray-600">Watch our students share their journey and success mantras</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {youtubeLinks.map((video, index) => (
            <a 
              key={video.id}
              href={video.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="bg-red-600 rounded-full p-4 shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <div className="p-4 bg-white">
                <h3 className="font-semibold text-gray-800 group-hover:text-red-600 transition-colors duration-300">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Watch Success Story →</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Floating Stats Section */}
      <div className="max-w-7xl mx-auto mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-blue-600">10,000+</div>
            <p className="text-gray-600 text-sm mt-2">Happy Students</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-green-600">98%</div>
            <p className="text-gray-600 text-sm mt-2">Success Rate</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-purple-600">50+</div>
            <p className="text-gray-600 text-sm mt-2">Expert Faculty</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-orange-600">24/7</div>
            <p className="text-gray-600 text-sm mt-2">Student Support</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-200 text-center">
        <p className="text-gray-500 text-sm">© 2026 Digital Learning Platform • Empowering Dreams, Building Futures</p>
      </footer>
    </div>
  );
};

export default TestimonialsPage;