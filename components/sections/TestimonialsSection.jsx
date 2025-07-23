"use client"
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    text: "We connect you to local farmers who commit to quality, ethical treatment of animals and humane farming practices.",
    name: "Andrew Garfield",
    role: "Cook"
  },
  {
    id: 2,
    text: "We connect you to local farmers who commit to quality, ethical treatment of animals and humane farming practices.",
    name: "Andrew Garfield",
    role: "Cook"
  },
  {
    id: 3,
    text: "We connect you to local farmers who commit to quality, ethical treatment of animals and humane farming practices.",
    name: "Andrew Garfield",
    role: "Cook"
  },
  {
    id: 4,
    text: "We connect you to local farmers who commit to quality, ethical treatment of animals and humane farming practices.",
    name: "Andrew Garfield",
    role: "Cook"
  },
  {
    id: 5,
    text: "We connect you to local farmers who commit to quality, ethical treatment of animals and humane farming practices.",
    name: "Andrew Garfield",
    role: "Cook"
  },
  {
    id: 6,
    text: "We connect you to local farmers who commit to quality, ethical treatment of animals and humane farming practices.",
    name: "Andrew Garfield",
    role: "Cook"
  }
];

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Create extended array for infinite loop
  const extendedTestimonials = [
    ...testimonials.slice(-1), // Last item at the beginning
    ...testimonials,
    ...testimonials.slice(0, 1) // First item at the end
  ];

  // Auto-play functionality
  useEffect(() => {
    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 4000);
    };

    startAutoPlay();

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, []);

  const resetAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    autoPlayRef.current = setInterval(() => {
      nextSlide();
    }, 4000);
  };

  const nextSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
    
    setTimeout(() => {
      if (currentIndex + 1 > testimonials.length) {
        setCurrentIndex(1);
        if (containerRef.current) {
          containerRef.current.style.transition = 'none';
          containerRef.current.style.transform = `translateX(-${1 * (280 + 32)}px)`;
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.style.transition = 'transform 0.5s ease-in-out';
            }
          }, 50);
        }
      }
      setIsTransitioning(false);
    }, 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prev => prev - 1);
    
    setTimeout(() => {
      if (currentIndex - 1 < 1) {
        setCurrentIndex(testimonials.length);
        if (containerRef.current) {
          containerRef.current.style.transition = 'none';
          containerRef.current.style.transform = `translateX(-${testimonials.length * (280 + 32)}px)`;
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.style.transition = 'transform 0.5s ease-in-out';
            }
          }, 50);
        }
      }
      setIsTransitioning(false);
    }, 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning) return;
    setCurrentIndex(index + 1);
    resetAutoPlay();
  };

  return (
    <section className="w-full py-16 bg-[#2A2A2A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-white text-4xl md:text-5xl lg:text-6xl font-light mb-8" 
              style={{ fontFamily: 'serif' }}>
            What our customers say.
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Cards Container */}
          <div className="overflow-hidden">
            <div
              ref={containerRef}
              className="flex gap-8 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (280 + 32)}px)`,
                width: `${extendedTestimonials.length * (280 + 32)}px`
              }}
            >
              {extendedTestimonials.map((testimonial, index) => (
                <div
                  key={`${testimonial.id}-${index}`}
                  className="flex-shrink-0 bg-white rounded-[10px] p-6"
                  style={{
                    width: '280px',
                    height: '240px'
                  }}
                >
                  <div className="h-full flex flex-col justify-between">
                    {/* Testimonial Text */}
                    <p 
                      className="text-[#333] mb-6"
                      style={{
                        fontFamily: 'Lexend Deca, sans-serif',
                        fontWeight: 400,
                        fontSize: '16px',
                        lineHeight: '24px',
                        letterSpacing: '0%'
                      }}
                    >
                      {testimonial.text}
                    </p>
                    
                    {/* Author Info */}
                    <div 
                      className="flex flex-col gap-2"
                      style={{
                        width: '171px',
                        height: '52px'
                      }}
                    >
                      <h4 className="text-[#333] font-semibold text-lg">
                        {testimonial.name}
                      </h4>
                      <p className="text-[#666] text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => { prevSlide(); resetAutoPlay(); }}
              className="w-12 h-12 rounded-full border-2 border-white/30 text-white/70 hover:border-white hover:text-white transition-all duration-300 flex items-center justify-center group"
              disabled={isTransitioning}
            >
              <ChevronLeft size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => { nextSlide(); resetAutoPlay(); }}
              className="w-12 h-12 rounded-full border-2 border-white/30 text-white/70 hover:border-white hover:text-white transition-all duration-300 flex items-center justify-center group"
              disabled={isTransitioning}
            >
              <ChevronRight size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  (currentIndex === index + 1) || 
                  (currentIndex === 0 && index === testimonials.length - 1) ||
                  (currentIndex === testimonials.length + 1 && index === 0)
                    ? 'bg-white w-6' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                disabled={isTransitioning}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}