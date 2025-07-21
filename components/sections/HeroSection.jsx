"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Wallet, Gift, Truck, Phone } from 'lucide-react';

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
      icon: <Wallet className="w-6 h-6" />, 
      title: "CASH ON DELIVERY", 
      description: "100% money back guarantee"
    },
    {
      icon: <Gift className="w-6 h-6" />, 
      title: "SPECIAL GIFT CARD", 
      description: "Offer special bonuses with gift"
    },
    {
      icon: <Truck className="w-6 h-6" />, 
      title: "FREE SHIPPING IN LAGOS", 
      description: "On Orders over ₦ 20,000.00"
    },
    {
      icon: <Phone className="w-6 h-6" />, 
      title: "24/7 CUSTOMER SERVICE", 
      description: "Call us +234 90 783 547 44"
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section 
        className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed sm:bg-scroll" 
        style={{
          backgroundImage: `url('/assets/hero-bg.webp')`
        }}
      >
        {/* Background overlay - strong opacity for text visibility */}
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 container mx-auto px-2 py-12">
          <motion.div 
            className="flex flex-col justify-center min-h-screen space-y-8 text-left sm:text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="sm:flex sm:justify-center">
              <span className="inline-block bg-yellow-500 text-black px-6 py-3 rounded-full text-sm font-bold">
                Organic Fresh Chicken
              </span>
            </motion.div>

            {/* Main Heading - Huge on mobile, left-aligned */}
            <motion.h1 
              className="text-6xl sm:text-5xl md:text-6xl lg:text-8xl text-white leading-[1.1] w-full max-w-none sm:max-w-4xl sm:mx-auto"
              variants={itemVariants}
            >
              Fresh, Safe Quality, Tender Chickens
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              className="text-white text-lg sm:text-xl md:text-2xl w-full max-w-none sm:max-w-2xl sm:mx-auto"
              variants={itemVariants}
            >
              Food that matters - to me, to farmers and to the planet we all share.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-8 sm:justify-center"
              variants={itemVariants}
            >
              <button className="bg-yellow-500 hover:bg-yellow-500 text-black font-bold px-8 py-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto">
                <ShoppingCart size={24} />
                Build my pack
              </button>
              <button className="text-white border-2 border-white hover:bg-yellow-600 hover:text-black font-bold px-8 py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 text-lg bg-black/50 hover:scale-105 transform w-full sm:w-auto">
                <ShoppingCart size={24} />
                How it Works
              </button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div 
              className="hidden sm:flex sm:justify-center"
              variants={itemVariants}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-6 h-10 border-2 border-yellow-400 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-yellow-400 rounded-full mt-62"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Outside hero with solid background */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
              key={index}
              className="flex flex-col items-center text-center gap-4 bg-[#191919] p-8 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-sm hover:shadow-md group"
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ duration: 0.3 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-yellow-600 flex-shrink-0 bg-yellow-100 p-4 rounded-full">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-white group-hover:text-gray-900 font-bold text-sm mb-2 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-700 text-sm transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
            
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;