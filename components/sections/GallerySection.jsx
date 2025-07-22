'use client';
import { motion } from 'framer-motion';

const images = [
  '/assets/1.jpg',
  '/assets/2.jpg',
  '/assets/3.jpg',
  '/assets/hen.webp',
  '/assets/raw.jpg',
  '/assets/chi.webp',
  '/assets/farm.jpg',
  '/assets/3.jpg',
];

export default function GallerySection() {
  return (
    <section className="pt-16 px-2">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-6xl text-white mb-4">
          Inside the Poultry
        </h2>
        <p className="text-gray-400 text-lg">
          A glimpse into our farm and processes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {images.map((src, index) => (
          <motion.div
            key={index}
            className="relative overflow-hidden rounded-2xl group shadow-md"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={src}
              alt={`Gallery image ${index + 1}`}
              className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
