'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { whatsappHref } from '@/lib/site';

const faqs = [
  {
    question: 'How do I place an order?',
    answer:
      'Browse the shop and order online, or message us directly on WhatsApp, whichever is easier for you. Walk-in buyers are always welcome at the farm too.',
  },
  {
    question: 'What payment options do you accept?',
    answer:
      'Pay online with Paystack, by bank transfer, or with cash on delivery. Neighbourhood buyers can also simply pay cash at the farm.',
  },
  {
    question: 'Do you sell live chicken and catfish?',
    answer:
      'Yes. We supply live broilers and live catfish in bulk (from 200kg), alongside processed cuts, smoked fish and farm-fresh eggs.',
  },
  {
    question: 'Where do you deliver, and how fast?',
    answer:
      'We offer same-day and scheduled delivery across the Lagos mainland and island. Place your order early in the day to catch same-day delivery.',
  },
  {
    question: 'How fresh is the chicken and fish?',
    answer:
      'Everything is cleaned, cut or smoked to order, straight from our farm, never left sitting frozen for months.',
  },
  {
    question: 'Can I order in bulk or as a distributor?',
    answer:
      'Absolutely. We offer distributor and agent pricing for restaurants, caterers and resellers, reach out on WhatsApp and we’ll set you up.',
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-4 sm:px-10 lg:grid-cols-2 lg:gap-20 lg:px-16">
        {/* Left, intro + help card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:sticky lg:top-28 lg:self-start"
        >
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
            <HelpCircle size={28} />
          </span>
          <h2 className="mt-6 text-3xl font-bold text-brand-brown sm:text-4xl lg:text-5xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 max-w-md text-brand-brown/60">
            Everything about ordering, payment and delivery from Protein Pack.
          </p>

          <div className="mt-8 max-w-md rounded-2xl border border-brand-tan/50 bg-brand-cream p-6">
            <h3 className="text-lg font-bold text-brand-brown">Still have questions?</h3>
            <p className="mt-1 text-sm text-brand-brown/60">
              Chat with us on WhatsApp and we’ll sort you out in minutes.
            </p>
            <a
              href={whatsappHref('Hello Protein Pack! I have a question.')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-brown"
            >
              <FaWhatsapp size={18} />
              Chat on WhatsApp
            </a>
          </div>
        </motion.div>

        {/* Right, accordion */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl border bg-white transition-colors ${
                  isOpen ? 'border-brand-orange' : 'border-brand-tan/50'
                }`}
              >
                <button
                  onClick={() => setActiveIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-semibold text-brand-brown">{faq.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                      isOpen ? 'bg-brand-orange text-white' : 'bg-brand-cream text-brand-orange'
                    }`}
                  >
                    <ChevronDown size={18} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 leading-relaxed text-brand-brown/70">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
