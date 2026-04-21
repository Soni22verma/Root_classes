import React, { useEffect, useState } from 'react';
import Classes from './Classes';
import Testimonial from './Testimonial';
import CallBack from './CallBack';
import Experts from './Experts';
// import StatsBar from './StatsBar';
import WhyChooseUs from './WhyChooseUs';
import FAQ from './FAQ';
import axios from 'axios';
import api from '../../services/endpoints';

const SliderPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([
    {
      _id: 'default',
      image: "/assets/roots_bg.png", // High-quality default image from public assets
      title: "Welcome to Roots Classes",
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
          <div className="relative h-[130px] sm:h-[180px] md:h-[260px] lg:h-[320px] w-full overflow-hidden bg-gray-100">
            {slides.map((slide, idx) => (
              <div
                key={slide._id || idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <img src={slide.image} alt={slide.title || `Slide ${idx + 1}`} className="w-full h-full object-cover" />
                {/* Optional: Add text overlay if needed, though current UI seems to just show image */}
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
