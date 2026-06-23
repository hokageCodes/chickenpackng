"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoxIcon, ArrowRightCircleIcon } from 'lucide-react';

// Hardcoded product words that cycle in the hero headline (not from backend).
const PRODUCT_WORDS = [
  'Tender Chicken',
  'Smoked Fish',
  'Chicken Breast',
  'Chicken Wings',
  'Live Catfish',
  'Farm-Fresh Eggs',
];

// Hero Section Component
const HeroSection = () => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setWordIndex((i) => (i + 1) % PRODUCT_WORDS.length),
      2200
    );
    return () => clearInterval(id);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section
      className={`
        relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed 
        sm:bg-scroll px-4 sm:px-[111px]
        bg-[url('/assets/hero-mobile.jpg')] sm:bg-[url('/assets/hero-bg.webp')]
      `}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-2 md:py-6">
        <motion.div
          className="flex flex-col justify-center min-h-screen pt-32 sm:pt-0 space-y-8 text-center sm:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Tag */}
          <motion.div variants={itemVariants} className="flex justify-center sm:justify-start">
            <div
              className="inline-flex items-center justify-center text-sm sm:text-base"
              style={{
                backgroundColor: '#733D394D',
                color: '#A88683',
                fontFamily: 'Lexend Deca',
                borderRadius: '100px',
                padding: '4px 8px',
                gap: '10px'
              }}
            >
              Chicken • Fish • Eggs
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-white text-4xl sm:text-8xl leading-tight max-w-full text-center sm:text-left"
            variants={itemVariants}
            style={{
              fontFamily: 'Viaoda Libre',
              fontWeight: 400,
              letterSpacing: '-2%',
              maxWidth: '900px'
            }}
          >
            Fresh, Safe Quality,{' '}
            <span className="relative inline-block align-bottom">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  className="inline-block whitespace-nowrap text-brand-orange"
                  initial={{ y: '0.4em', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '-0.4em', opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  {PRODUCT_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>

              {/* Hand-drawn underline, redraws on each word change */}
              <svg
                className="pointer-events-none absolute left-0 -bottom-2 sm:-bottom-4 w-full"
                height="18"
                viewBox="0 0 300 18"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <motion.path
                  key={wordIndex}
                  d="M4 11 C 64 4, 122 5, 168 9 C 214 13, 260 12, 296 6"
                  stroke="#EC6809"
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.55, ease: 'easeInOut', delay: 0.25 }}
                />
              </svg>
            </span>
          </motion.h1>

          {/* Subtext */}
          <p
            className="text-center sm:text-left px-2 sm:px-0"
            variants={itemVariants}
            style={{
              fontFamily: 'Lexend Deca',
              fontWeight: 500,
              fontSize: '16px',
              lineHeight: '26px',
              color: '#98A2B3'
            }}
          >
            Food that matters - to me, to farmers and to the planet we all share.
          </p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 mt-6 sm:items-start items-center"
            variants={itemVariants}
          >
            <button
              className="text-white text-base font-bold rounded-full transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
              style={{
                backgroundColor: '#733D394D',
                border: '1px solid white',
                borderRadius: '100px',
                padding: '12px 24px',
                gap: '8px'
              }}
            >
              Build my pack
              <BoxIcon size={20} />
            </button>

            <button
              className="text-white font-bold rounded-full transition-all duration-200 flex items-center justify-center hover:scale-105 transform w-full sm:w-auto"
              style={{
                backgroundColor: '#733D394D',
                border: '2px solid white',
                borderRadius: '100px',
                padding: '12px 24px',
                gap: '8px'
              }}
            >
              How it Works
              <ArrowRightCircleIcon size={20} />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
