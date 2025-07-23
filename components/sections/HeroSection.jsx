"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Wallet, Gift, Truck, Phone, BoxIcon, ArrowRightCircleIcon } from 'lucide-react';

// Hero Section Component
const HeroSection = () => {
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

  const features = [
    {
      icon: <Wallet className="w-8 h-8" />, 
      title: "CASH ON DELIVERY", 
      description: "100% money back guarantee"
    },
    {
      icon: <Gift className="w-8 h-8" />, 
      title: "SPECIAL GIFT CARD", 
      description: "Offer special bonuses with gift"
    },
    {
      icon: <Truck className="w-8 h-8" />, 
      title: "FREE SHIPPING IN LAGOS", 
      description: "On Orders over ₦ 20,000.00"
    },
    {
      icon: <Phone className="w-8 h-8" />, 
      title: "24/7 CUSTOMER SERVICE", 
      description: "Call us +234 90 783 547 44"
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section 
  className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed sm:bg-scroll px-4 sm:px-[111px]"
  style={{
    backgroundImage: `url('/assets/hero-bg.webp')`
  }}
>
  {/* Background overlay */}
  <div className="absolute inset-0 bg-black/50"></div>

  <div className="relative z-10 max-w-screen-xl mx-auto px-2 py-12">
    <motion.div 
      className="flex flex-col justify-center min-h-screen space-y-8 text-center sm:text-left"
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
          Organic Fresh Chicken
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h1 
        className="text-white text-4xl sm:text-8xl leading-tight max-w-full text-center sm:text-left"
        variants={itemVariants}
        style={{
          fontFamily: 'Viaoda Libre',
          fontWeight: 400,
          letterSpacing: '-2%'
        }}
      >
        Fresh, Safe Quality, Tender Chickens
      </motion.h1>

      {/* Subtext */}
      <motion.p 
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
      </motion.p>

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

      {/* Features */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mt-10 items-center sm:items-start"
        variants={itemVariants}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="flex items-center transition-all duration-300 shadow-sm hover:shadow-md group w-full sm:w-auto px-4 py-2"
            whileHover={{ scale: 1.02 }}
            style={{
              backgroundColor: 'rgba(80, 13, 7, 0.3)',
              borderRadius: '10px'
            }}
          >
            <div 
              className="flex-shrink-0 flex items-center justify-center text-yellow-500 mr-2"
              style={{
                width: '32px',
                height: '32px'
              }}
            >
              {feature.icon}
            </div>
            <div className="flex flex-col text-left">
              <h3 
                className="text-xs sm:text-sm"
                style={{
                  fontFamily: 'Lexend Deca',
                  fontWeight: 500,
                  color: '#A88683'
                }}
              >
                {feature.title}
              </h3>
              <p 
                className="text-xs"
                style={{
                  fontFamily: 'Lexend Deca',
                  fontWeight: 400,
                  color: '#733D39'
                }}
              >
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  </div>
</section>

    </>
  );
};

export default HeroSection;