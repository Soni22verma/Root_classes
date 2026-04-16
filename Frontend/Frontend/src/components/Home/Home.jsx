import React, { useEffect, useState } from 'react';
import Classes from './Classes';
import Testimonial from './Testimonial';
import CallBack from './CallBack';
import Experts from './Experts';
import axios from 'axios';
import api from '../../services/endpoints';
import { Link } from 'react-router-dom';

const SliderPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const GetSlider = async () => {
    try {
      setLoading(true);
      const res = await axios.post(api.slider.getSlider);
      console.log("Full response:", res);
      console.log("Response data:", res.data);
      console.log("Data array:", res.data?.data);
      
      // Fix: Check the correct path to your data
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        setSlides(res.data.data);
      } else if (res.data && res.data.data && res.data.data.data && Array.isArray(res.data.data.data)) {
        setSlides(res.data.data.data);
      } else {
        console.log("No data found in response");
        setError('No slider data found');
        setSlides([]);
      }
    } catch (error) {
      console.log("API Error:", error);
      setError('Failed to load slider data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetSlider();
  }, []);

  const getFieldValue = (slide, field, defaultValue) => {
    return slide[field] && slide[field].trim() !== '' ? slide[field] : defaultValue;
  };

  if (loading) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading slides...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">{error}</div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">No slides available</div>
      </div>
    );
  }

  const current = slides[currentSlide];

  return (
    <>
      <div className="relative w-full h-screen overflow-hidden font-sans">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700 ease-in-out"
          style={{ backgroundImage: `url(${current.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight drop-shadow-lg">
              {getFieldValue(current, 'title', 'Welcome to Roots Classes')}
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto drop-shadow-md">
              {getFieldValue(current, 'subtitle', 'Best coaching for competitive exams')}
            </p>
            
           <Link to="/course">
            <button className="px-8 py-3 bg-white text-indigo-900 font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300">
              {getFieldValue(current, 'buttonText', 'Join Now')}
            </button>
           </Link>
          </div>

          {/* Class Info Badge */}
          <div className="absolute bottom-32 left-0 right-0 flex justify-center">
            <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-sm md:text-base font-medium">
              {getFieldValue(current, 'classText', '7th • 8th • 9th • 10th • 11th • 12th | JEE • NEET • NDA')}
            </div>
          </div>
        </div>

        {/* Slider Controls - Only show if more than 1 slide */}
        {slides.length > 1 && (
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
        )}
      </div>

      <Classes />
      <Testimonial />
      <CallBack />
      <Experts />
    </>
  );
};

export default SliderPage;