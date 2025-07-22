'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiHelpCircle } from 'react-icons/fi';

const faqs = [
  {
    question: 'How do I store the meat once delivered?',
    answer:
      'We recommend freezing the meat immediately upon delivery unless you plan to cook it the same day. Our vacuum-sealed packaging maintains freshness for up to 6 months in the freezer.',
  },
  {
    question: 'Do you deliver outside Lagos?',
    answer:
      'Currently, our deliveries are limited to Lagos, but we are expanding soon. Subscribe to our newsletter to be the first to know when we reach your area.',
  },
  {
    question: 'Is the meat organic?',
    answer:
      'Yes, all our animals are grass-fed and raised without hormones or antibiotics. We work directly with local farmers who follow sustainable and ethical farming practices.',
  },
  {
    question: 'What are your delivery hours?',
    answer:
      'We deliver Monday through Saturday from 8 AM to 6 PM. Same-day delivery is available for orders placed before 2 PM.',
  },
  {
    question: 'How do you ensure meat quality during transport?',
    answer:
      'All meat is transported in temperature-controlled vehicles with dry ice to maintain the cold chain. Each package includes a temperature indicator to ensure quality upon delivery.',
  },
  {
    question: 'Can I customize my order?',
    answer:
      'Absolutely! You can specify cuts, portions, and special preparations. Contact us directly for bulk orders or special requests.',
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <section className="py-12 px-2 relative overflow-hidden bg-[#FEFBF6] text-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 text-black rounded-2xl mb-6">
            <FiHelpCircle size={32} />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-700 mb-8 max-w-md">
            Everything you need to know about our premium meat delivery service.
          </p>
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200 max-w-md">
            <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
            <p className="text-slate-600 mb-4">
              Our customer support team is here to help you with any concerns.
            </p>
            <button className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-xl transition hover:shadow-lg hover:scale-105 active:scale-95">
              Contact Support
            </button>
          </div>
        </motion.div>

        {/* Right Side (Scrollable FAQs) */}
        <div className="overflow-y-auto max-h-[600px] pr-2">
          <div className="flex flex-col gap-6">
            {faqs.map((faq, index) => {
              const isOpen = activeIndex === index;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow hover:shadow-md transition duration-300 hover:border-yellow-500">
                    <button
                      onClick={() =>
                        setActiveIndex(isOpen ? null : index)
                      }
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-medium text-lg pr-4 text-black">
                        {faq.question}
                      </span>
                      <motion.div
                        animate={{
                          rotate: isOpen ? 180 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="w-10 h-10 flex items-center justify-center rounded-full"
                      >
                        <FiChevronDown
                          size={22}
                          className={`${
                            isOpen ? 'text-green-600' : 'text-yellow-500'
                          } transition`}
                        />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="overflow-hidden px-6 pb-6"
                        >
                          <div className="h-px bg-slate-200 mb-4" />
                          <p className="text-slate-700 text-base">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
