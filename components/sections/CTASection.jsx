'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { whatsappHref } from '@/lib/site';

export default function CTASection() {
  return (
    <section className="bg-brand-cream py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="grid items-stretch gap-6 lg:grid-cols-2"
        >
          {/* Dark-orange card */}
          <div className="flex flex-col justify-center rounded-3xl bg-[#C2540A] p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready for farm-fresh protein?
            </h2>
            <p className="mt-4 text-base text-white/90 sm:text-lg">
              Order chicken, fish and eggs in minutes, pay online, by transfer, or cash on
              delivery. Straight from our farm to your door.
            </p>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-[#C2540A] transition-transform hover:scale-105"
            >
              <FaWhatsapp size={18} />
              Order on WhatsApp
            </a>
          </div>

          {/* White card */}
          <div className="flex flex-col justify-center rounded-3xl bg-white p-8 ring-1 ring-brand-tan/50 sm:p-12">
            <h3 className="text-2xl font-bold text-brand-brown sm:text-3xl">
              Prefer to browse first?
            </h3>
            <p className="mt-4 text-base text-brand-brown/60 sm:text-lg">
              Explore the full range, live birds &amp; catfish, processed cuts, smoked fish and
              eggs, and build your order at your own pace.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-brand-orange px-7 py-3.5 font-semibold text-white transition-colors hover:bg-brand-brown"
            >
              Browse the shop
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
