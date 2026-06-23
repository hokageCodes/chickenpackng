'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    eyebrow: 'Raise',
    headline: 'Raised on our farm',
    text: 'Healthy birds and catfish raised on clean feed, with real care from day one, no shortcuts.',
    image: '/assets/farm.jpg',
  },
  {
    number: '02',
    eyebrow: 'Process',
    headline: 'Processed fresh',
    text: 'Cleaned, cut or smoked to order, never left sitting frozen for months.',
    image: '/assets/raw.jpg',
  },
  {
    number: '03',
    eyebrow: 'Order',
    headline: 'Order your way',
    text: 'Pick exactly what you need on the site, or message us straight on WhatsApp.',
    image: '/assets/laps.jpg',
  },
  {
    number: '04',
    eyebrow: 'Deliver',
    headline: 'Delivered to you',
    text: 'Same-day and scheduled delivery across the Lagos mainland and island.',
    image: '/assets/enjoy.jpg',
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7 } },
};

const TextContent = ({ step }) => (
  <div className="relative">
    {/* ghost number */}
    <span className="pointer-events-none absolute -top-20 left-0 select-none text-[10rem] font-bold leading-none text-brand-orange/10">
      {step.number}
    </span>

    <div className="relative space-y-5">
      <div className="flex items-center gap-3">
        <span className="h-0.5 w-14 bg-brand-orange" />
        <p className="font-semibold uppercase tracking-widest text-brand-orange">
          {step.eyebrow}
        </p>
      </div>

      <h3 className="text-3xl font-bold text-brand-brown sm:text-4xl lg:text-5xl">
        {step.headline}
      </h3>
      <p className="max-w-md leading-relaxed text-brand-brown/60">{step.text}</p>

      <Link
        href="/products"
        className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-brown"
      >
        Start your order
        <ArrowRight size={18} />
      </Link>
    </div>
  </div>
);

const ImageBlock = ({ step }) => (
  <motion.div
    variants={imageVariants}
    className="h-72 overflow-hidden rounded-3xl shadow-xl ring-1 ring-brand-tan/40 sm:h-96 lg:h-[28rem]"
  >
    <Image
      src={step.image}
      alt={step.headline}
      width={1000}
      height={800}
      className="h-full w-full object-cover"
    />
  </motion.div>
);

export default function OurProcessSection() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-10 lg:px-16">
        {/* Section header */}
        <div className="mb-16 text-center sm:mb-20">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
            How it works
          </span>
          <h2 className="mt-2 text-3xl font-bold text-brand-brown sm:text-4xl lg:text-5xl">
            Our Process
          </h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="space-y-24 sm:space-y-32"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              {i % 2 === 0 ? (
                <>
                  <TextContent step={step} />
                  <ImageBlock step={step} />
                </>
              ) : (
                <>
                  <ImageBlock step={step} />
                  <TextContent step={step} />
                </>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
