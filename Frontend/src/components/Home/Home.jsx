import React, { useEffect, useState } from 'react';
import Classes from './Classes';
import Testimonial from './Testimonial';
import CallBack from './CallBack';
import Experts from './Experts';
import axios from 'axios';
import api from '../../services/endpoints';

const SliderPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const GetSlider = async () => {
    try {
      setLoading(true);
      const res = await axios.post(api.slider.getSlider);
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        setSlides(res.data.data);
      } else if (res.data && res.data.data && res.data.data.data && Array.isArray(res.data.data.data)) {
        setSlides(res.data.data.data);
      } else {
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

  // Auto-slide logic
  useEffect(() => {
    if (slides.length > 0 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 3000); 
      return () => clearInterval(interval);
    }
  }, [slides.length, isPaused]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="w-full h-48 md:h-64 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || slides.length === 0) return null;

  return (
    <>
      <div className="w-full bg-white">
        <div 
          className="w-full relative group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Slider Container - Thin & Panoramic PW Style */}
          <div className="relative h-[130px] sm:h-[180px] md:h-[260px] lg:h-[320px] w-full overflow-hidden bg-gray-50">
            {slides.map((slide, idx) => (
              <div
                key={slide._id || idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                  currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title || `Slide ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

              </div>
            ))}

            {/* Dots Indicator - Refined PW Style */}
            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    currentSlide === idx 
                      ? 'w-6 h-1.5 bg-white shadow-sm' 
                      : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Render Other Components */}
      <Classes />
      <Testimonial />
      <CallBack />
      <Experts />
    </>
  );
};

export default SliderPage;