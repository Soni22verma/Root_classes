import React, { useState } from 'react';
import Classes from './Classes';
import Testimonial from './Testimonial';
import CallBack from './CallBack';
import Experts from './Experts'
import { slides } from '../Constants/Constants';

const SliderPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

 

  const current = slides[currentSlide];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
   <>
    <div className="relative w-full h-screen overflow-hidden font-sans">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{ backgroundImage: `url(${current.bgImage})` }}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${current.overlayColor}`}></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight drop-shadow-lg">
            {current.title}
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto drop-shadow-md">
            {current.description}
          </p>
          
          {/* CTA Button */}
          <button className="px-8 py-3 bg-white text-indigo-900 font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300">
            Join Roots Classes
          </button>
        </div>

        {/* Class Range Badge */}
        <div className="absolute bottom-32 left-0 right-0 flex justify-center">
          <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-sm md:text-base font-medium">
            📚 7th • 8th • 9th • 10th • 11th • 12th | JEE • NEET • NDA
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center gap-6">
        {/* Dots Indicator */}
        <div className="flex gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === idx 
                  ? 'w-8 bg-white scale-110' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="flex gap-4">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-all duration-300 hover:scale-110"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-all duration-300 hover:scale-110"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Custom Animation Keyframes - Add to your global CSS or use inline style tag */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>

<Classes/>
<Testimonial/>
<CallBack/>
<Experts/>
   </>
  );
};

export default SliderPage;