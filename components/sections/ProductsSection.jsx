'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

const products = [
  {
    id: 1,
    weight: '3.5–6kgs of meat',
    title: 'Regular Box',
    desc: 'With YG Farms, you can be confident in the meat that you serve your family. You’ll support your local farmers who are focused on raising the highest quality products.',
    price: '₦14,999.99',
    originalPrice: '₦16,999.99',
    image: '/assets/hen.webp',
  },
  {
    id: 2,
    weight: '7–10kgs of meat',
    title: 'Large Box',
    desc: 'With YG Farms, you can be confident in the meat that you serve your family. You’ll support your local farmers who are focused on raising the highest quality products.',
    price: '₦24,999.99',
    originalPrice: '₦26,999.99',
    image: '/assets/hen.webp',
  },
];

export default function ProductSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-2">
        <div className="grid lg:grid-cols-2 gap-12">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              className="bg-[#2D2D2D] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="md:flex">
                <div className="md:w-1/2">
                  <Image
                    src={product.image}
                    alt="product image"
                    width={500}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-4 flex flex-col justify-between gap-4 text-white">
                  <p className="text-2xl md:-mb-12 text-yellow-500 font-medium">{product.weight}</p>
                  <h2 className="text-4xl">{product.title}</h2>
                  <p className="text-lgs text-gray-300">{product.desc}</p>
                  <div className="text-lg font-bold space-x-3">
                    <span>{product.price}</span>
                    <span className="line-through text-red-400">{product.originalPrice}</span>
                  </div>
                  <button className="bg-yellow-500 hover:bg-yellow-500 text-black font-bold px-8 py-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 text-md shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto">
                        <ShoppingCart size={24} />
                        Order This Package
                    </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
