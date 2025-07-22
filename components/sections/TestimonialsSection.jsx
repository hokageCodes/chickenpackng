'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const testimonials = [
  {
    name: 'Marcus Rivera',
    role: 'Executive Chef',
    company: 'Meridian Restaurant Group',
    quote: 'YG Farms has revolutionized our supply chain. The consistency and flavor profile of their premium cuts elevates every dish we serve.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: 'New York'
  },
  {
    name: 'Dr. Sarah Chen',
    role: 'Sports Nutritionist',
    company: 'Elite Performance Institute',
    quote: 'The nutritional integrity and ethical sourcing practices at YG Farms align perfectly with our athletes\' performance and wellness goals.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    location: 'California'
  },
  {
    name: 'James Wellington III',
    role: 'Culinary Director',
    company: 'Prestige Hospitality',
    quote: 'In 30 years of fine dining, I\'ve never encountered such consistently exceptional quality. YG Farms sets the gold standard.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    location: 'Texas'
  },
  {
    name: 'Isabella Martinez',
    role: 'Wellness Coach',
    company: 'Pure Living Collective',
    quote: 'My clients\' transformations speak volumes. YG Farms delivers on both taste and the clean nutrition my programs demand.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    location: 'Florida'
  },
  {
    name: 'Robert Kim',
    role: 'Food & Beverage Director',
    company: 'Luxury Resort Chain',
    quote: 'Our guests expect perfection. YG Farms consistently delivers premium quality that exceeds even our highest standards.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    location: 'Nevada'
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left - rect.width / 2) / 20,
      y: (e.clientY - rect.top - rect.height / 2) / 20
    });
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-white text-sm font-semibold tracking-wider uppercase mb-2 block">
            Testimonials
          </span>
          <h2 className="text-5xl md:text-6xl text-white mb-6 leading-tight">
            Stories of <span className="text-white">Excellence</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover why industry leaders trust YG Farms for their premium needs
          </p>
        </motion.div>

        {/* Main Testimonial Card */}
        <div className="relative max-w-4xl mx-auto mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="relative"
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: 15 }}
              transition={{ duration: 0.6 }}
              onMouseMove={handleMouseMove}
              style={{
                transform: `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`
              }}
            >
              <div className="border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl hover:shadow-3xl transition-all duration-500">
                <motion.div className="text-yellow-500 mb-8">
                  <FaQuoteLeft size={48} />
                </motion.div>

                <p className="text-2xl md:text-3xl max-w-xl text-center mx-auto font-light text-white leading-relaxed mb-8">
                  "{testimonials[currentIndex].quote}"
                </p>

                <motion.div
                  className="flex items-center justify-center space-x-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="text-center">
                    <h4 className="text-xl font-semibold text-white">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="text-purple-300">
                      {testimonials[currentIndex].role}
                    </p>
                    <p className="text-sm text-gray-400">
                      {testimonials[currentIndex].company} • {testimonials[currentIndex].location}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <motion.button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevTestimonial}
          >
            <FaChevronLeft />
          </motion.button>

          <motion.button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextTestimonial}
          >
            <FaChevronRight />
          </motion.button>
        </div>

        {/* Mini Testimonial Cards */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => {
            const isActive = index === currentIndex;
            return (
              <motion.div
                key={index}
                className={`cursor-pointer transition-all duration-300 p-6 rounded-2xl border 
                  ${
                    isActive 
                      ? 'bg-white/10 border-purple-500 scale-105 shadow-lg' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                whileHover={{ y: -6, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => goToSlide(index)}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h5 className="text-white font-semibold text-sm">
                      {testimonial.name}
                    </h5>
                    <p className="text-purple-300 text-xs">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm line-clamp-3">
                  "{testimonial.quote.substring(0, 100)}..."
                </p>
              </motion.div>
            );
          })}
        </div> */}
      </div>
    </section>
  );
}
