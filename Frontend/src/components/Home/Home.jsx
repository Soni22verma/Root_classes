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

  useEffect(() => {
    if (slides.length > 0 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [slides.length, isPaused]);

  return (
    <>
      {/* Slider */}
      {slides.length > 0 && (
        <div
          className="relative w-full"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative aspect-[1.8/1] md:aspect-[3.5/1] lg:aspect-[4.5/1] w-full overflow-hidden bg-gray-50">
            {slides.map((slide, idx) => (
              <div
                key={slide._id || idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                {/* 1. Subtle Blurred Background to fill the edges (prevents black bars) */}
                <div
                  className="absolute inset-0 w-full h-full bg-center bg-cover blur-2xl scale-110 opacity-30"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />

                {/* 2. Main Image (Zero cutting, fully visible) */}
                <div className="relative w-full h-full flex items-center justify-center z-10">
                  <img
                    src={slide.image}
                    alt={slide.title || `Slide ${idx + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            ))}
            <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all duration-300 rounded-full ${currentSlide === idx ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
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
