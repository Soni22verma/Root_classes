import React, { useEffect, useState } from 'react';
import Classes from './Classes';
import Testimonial from './Testimonial';
import CallBack from './CallBack';
import Experts from './Experts';
import StatsBar from './StatsBar';
import WhyChooseUs from './WhyChooseUs';
import FAQ from './FAQ';
import axios from 'axios';
import api from '../../services/endpoints';
import fallbackImage from '../../assets/fallback.jpg';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SliderPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([
    {
      _id: 'default',
      image: fallbackImage, // fallback
      title: "Roots Classes",
      subtitle: "Empowering Your Future with Quality Education",
      buttonText: "Explore Courses",
      classText: "Join the Journey"
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const GetSlider = async () => {
    try {
      // Keep showing the default slide while loading
      const res = await axios.post(api.slider.getSlider);
      if (res.data && res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setSlides(res.data.data);
      } else if (res.data?.data?.data && Array.isArray(res.data.data.data) && res.data.data.data.length > 0) {
        setSlides(res.data.data.data);
      }
      // If API fails or returns empty, we keep the default slide
    } catch (error) {
      console.log('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { GetSlider(); }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (slides.length > 0 && !isPaused) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [slides.length, isPaused]);

  return (
    <>
      {/* Slider */}
      {slides.length > 0 && (
        <div
          className="relative w-full group overflow-hidden bg-white sm:px-4 lg:px-6 mt-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative aspect-[2/1] md:aspect-[3.5/1] lg:aspect-[4.5/1] w-full overflow-hidden shadow-lg border border-gray-100">
            {slides.map((slide, idx) => (
              <div
                key={slide._id || idx}
                className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out transform ${currentSlide === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
              >
                {/* 1. Main Image (Premium cover look) */}
                <img
                  src={slide.image}
                  alt={slide.title || `Slide ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* 2. Optional Gradient Overlay (PW style for readability) */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent z-10" />
              </div>
            ))}

            {/* Navigation Arrows (PW Style) */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-800 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-800 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
            >
              <ChevronRight size={24} />
            </button>

            {/* Pagination Dots (Modern Pill Style) */}
            <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all duration-300 rounded-full h-1.5 ${currentSlide === idx ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="relative z-20">
        <StatsBar />
      </div>

      {/* Programs */}
      <Classes />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Expert Faculty */}
      <Experts />

      {/* Student Testimonials + Videos */}
      <Testimonial />

      {/* FAQ */}
      <FAQ />

      {/* Callback Form */}
      <CallBack />
    </>
  );
};

export default SliderPage;
