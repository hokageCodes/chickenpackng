'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const sections = [
  {
    id: 'combo',
    title: 'Combo Pack',
    bgImage: '/assets/ken.jpg',
    verticalText: 'Combo Pack',
  },
  {
    id: 'wings',
    title: 'Wings',
    bgImage: '/assets/wings.jpg',
    verticalText: 'Wings',
  },
  {
    id: 'laps',
    title: 'Laps',
    bgImage: '/assets/laps.jpg',
    verticalText: 'Laps',
  },
];

export default function PopularProducts() {
  const [activeSection, setActiveSection] = useState('combo');

  return (
    <section className="w-full py-10 px-2 sm:px-10 lg:px-[111px] overflow-hidden">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-start gap-10">
        {/* LEFT TEXT + FORM */}
        <motion.div
          className="w-full lg:w-[475px] mt-4 flex flex-col gap-12"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-white font-['Viaoda_Libre'] text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] leading-[1.05] tracking-[-0.02em] w-full lg:w-[415px]">
            Our<br />Popular<br />Products
          </h1>

          <div className="flex w-full flex-col sm:flex-row gap-4">
            <motion.input
              type="text"
              placeholder="SEARCH YOUR PRODUCTS"
              className="w-full sm:max-w-md px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3D3C42]"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.button
              className="h-[60px] sm:h-[100px] w-full sm:w-[100px] bg-[#500D07] text-white text-3xl rounded-lg hover:bg-[#3F2E3E] transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              GO
            </motion.button>
          </div>
        </motion.div>

        {/* RIGHT SECTION */}
        {/* Desktop Version */}
        <motion.div
          className="hidden lg:flex w-full lg:w-[832px] h-[500px] mt-[14px] gap-4 overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {sections.map((section) => {
            const isActive = activeSection === section.id;

            return (
              <motion.div
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`relative rounded-[10px] overflow-hidden cursor-pointer transition-all duration-500 ease-in-out flex-shrink-0 ${
                  isActive ? 'w-[500px]' : 'w-[150px]'
                } h-[500px]`}
                animate={{ width: isActive ? 500 : 150 }}
              >
                <Image
                  src={section.bgImage}
                  alt={section.title}
                  fill
                  className="object-cover"
                  priority={isActive}
                />

                <div className="absolute inset-0"></div>

                <AnimatePresence mode="wait">
                  {isActive ? (
                    <motion.div
                      key="activeText"
                      className="absolute bottom-[26px] left-[176px] w-[324px] h-[100px] bg-white text-[#280704] rounded-lg px-6 py-4 flex items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-3xl sm:text-5xl w-full text-center">{section.title}</h3>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="verticalText"
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 w-[70px] p-2 -rotate-90 text-white font-bold text-lg sm:text-5xl whitespace-nowrap"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {section.verticalText}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Mobile Version - Horizontal Scroll */}
        <div className="lg:hidden w-full">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-2 -mx-2 snap-x snap-mandatory">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                className="relative flex-shrink-0 w-[280px] h-[320px] rounded-[10px] overflow-hidden cursor-pointer snap-center"
                onClick={() => setActiveSection(section.id)}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Image
                  src={section.bgImage}
                  alt={section.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Title Badge */}
                <motion.div 
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-xl text-[#280704] font-bold text-lg shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  {section.title}
                </motion.div>

                {/* Active Indicator */}
                {activeSection === section.id && (
                  <motion.div
                    className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Optional: Scroll Indicator Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeSection === section.id 
                    ? 'bg-white w-6' 
                    : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}