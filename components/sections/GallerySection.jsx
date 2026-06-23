'use client';

import { motion } from 'framer-motion';

const images = [
  { src: '/assets/farm.jpg', alt: 'Our farm' },
  { src: '/assets/hen.webp', alt: 'Healthy live birds' },
  { src: '/assets/raw.jpg', alt: 'Freshly processed chicken' },
  { src: '/assets/chi.webp', alt: 'Chicken breast cuts' },
  { src: '/assets/laps.jpg', alt: 'Chicken laps' },
  { src: '/assets/wings.jpg', alt: 'Chicken wings' },
  { src: '/assets/enjoy.jpg', alt: 'Ready to enjoy' },
  { src: '/assets/2.jpg', alt: 'Inside the farm' },
];

export default function GallerySection() {
  return (
    <section className="bg-brand-brown py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-peach">
            Gallery
          </span>
          <h2 className="mt-2 text-3xl font-bold text-brand-cream sm:text-4xl lg:text-5xl">
            Freshly packed
          </h2>
          <p className="mt-3 text-brand-cream/60">
            A glimpse of the quality we deliver with every order.
          </p>
        </div>

        {/* Uniform grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((img, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="group relative overflow-hidden rounded-2xl shadow-md ring-1 ring-brand-cream/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="h-64 w-full transform object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-brand-brown/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
