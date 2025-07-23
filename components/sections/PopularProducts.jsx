'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PopularProducts = () => {
  const [activeSection, setActiveSection] = useState('combo');

  const sections = [
    {
      id: 'combo',
      title: 'Combo Pack',
    //   subtitle: 'Best value chicken selection',
      bgImage: 'bg-gradient-to-br from-amber-700 via-orange-600 to-red-700',
      verticalText: 'Combo Pack'
    },
    {
      id: 'wings',
      title: 'Wings',
    //   subtitle: 'Crispy chicken wings',
      bgImage: 'bg-gradient-to-br from-yellow-600 via-amber-500 to-orange-600',
      verticalText: 'Wings'
    },
    {
      id: 'laps',
      title: 'Laps',
    //   subtitle: 'Tender chicken thighs',
      bgImage: 'bg-gradient-to-br from-orange-400 via-yellow-400 to-amber-400',
      verticalText: 'Laps'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#FEFBF6] relative">
      <div className="max-w-[1440px] mx-auto px-[111px] py-20 flex flex-col lg:flex-row items-start gap-10">
        {/* Left Content */}
        <motion.div 
          className="w-[475px] h-[452px] mt-[38px] flex flex-col gap-[52px]"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="w-[415px] h-[300px] text-[#3D3C42] leading-[100px] tracking-[-0.02em]">
            <h1 className="font-['Viaoda_Libre'] font-normal text-[96px]">
              Our<br />
              Popular<br />
              Products
            </h1>
          </div>

          <div className="w-[475px] h-[100px] flex gap-2">
            <motion.input
              type="text"
              placeholder="SEARCH YOUR PRODUCTS"
              className="w-[375px] h-[100px] bg-transparent border border-[#D0D5DD] rounded-lg text-[#3D3C42] px-5 text-base outline-none placeholder-[#D0D5DD] focus:border-[#3D3C42] transition-colors"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <motion.button
              className="w-[100px] h-[100px] bg-[#500D07] text-white font-bold rounded-lg hover:bg-[#6b1009] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              GO
            </motion.button>
          </div>
        </motion.div>

        {/* Right Slider */}
        <motion.div 
          className="w-[832px] h-[500px] mt-[14px] flex gap-4 relative"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          {sections.map((section) => {
            const isActive = activeSection === section.id;

            return (
              <motion.div
                key={section.id}
                className={`h-[500px] rounded-[10px] relative cursor-pointer overflow-hidden flex-shrink-0 transition-all duration-500 ease-in-out ${
                  isActive ? section.bgImage : 'bg-[#FCFCFD]'
                }`}
                animate={{ width: isActive ? 500 : 150 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                onClick={() => setActiveSection(section.id)}
              >
                {/* Background circles */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 opacity-30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute top-20 left-16 w-16 h-16 bg-yellow-200 rounded-full opacity-60"></div>
                    <div className="absolute top-32 right-20 w-12 h-12 bg-orange-200 rounded-full opacity-60"></div>
                    <div className="absolute bottom-32 left-20 w-20 h-20 bg-red-200 rounded-full opacity-60"></div>
                    <div className="absolute bottom-20 right-16 w-14 h-14 bg-yellow-300 rounded-full opacity-60"></div>
                  </motion.div>
                )}

                <AnimatePresence>
                  {isActive ? (
                    <motion.div
                      className="absolute bottom-[26px] left-[176px] w-[324px] h-[100px] bg-black/70 text-white rounded-lg flex flex-col gap-[10px] px-6 py-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <div className="text-2xl font-bold">{section.title}</div>
                      <div className="text-base opacity-80">{section.subtitle}</div>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-90 text-2xl font-bold text-gray-700 whitespace-nowrap"
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
      </div>
    </div>
  );
};

export default PopularProducts;
