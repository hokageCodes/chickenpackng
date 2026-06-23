'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { ArrowRight, Drumstick, Fish, Egg } from 'lucide-react';
import { popularProducts } from '@/data/popular';
import { whatsappHref } from '@/lib/site';

// Curated mix for the homepage (a taste across types/forms, not the full catalog).
// The complete, categorized listing lives on the Shop page (/products).
const FEATURED_IDS = ['chicken-laps', 'live-chicken', 'smoked-catfish', 'crate-of-eggs'];

const TYPE_ICON = { Chicken: Drumstick, Fish: Fish, Eggs: Egg };

const FORM_BADGE = {
  Live: 'bg-brand-brown text-white',
  Processed: 'bg-brand-orange text-white',
  Fresh: 'bg-brand-peach text-brand-brown',
};

function ProductMedia({ product }) {
  const Icon = TYPE_ICON[product.type] ?? Drumstick;
  return (
    <div className="relative aspect-[4/3] overflow-hidden">
      {product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-cream to-brand-tan/50">
          <Icon className="h-12 w-12 text-brand-brown/30" />
          <span className="text-xs font-medium text-brand-brown/40">Photo coming soon</span>
        </div>
      )}
      <span
        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${FORM_BADGE[product.form]}`}
      >
        {product.form}
      </span>
    </div>
  );
}

export default function PopularProducts() {
  const featured = FEATURED_IDS.map((id) =>
    popularProducts.find((p) => p.id === id)
  ).filter(Boolean);

  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
              Our Range
            </span>
            <h2 className="mt-2 text-3xl font-bold text-brand-brown sm:text-4xl lg:text-5xl">
              Popular Products
            </h2>
            <p className="mt-2 max-w-md text-brand-brown/60">
              A taste of what we farm, live birds &amp; catfish, processed cuts, smoked fish and eggs.
            </p>
          </div>

          <Link
            href="/products"
            className="hidden items-center gap-2 text-base font-semibold text-brand-brown transition-colors hover:text-brand-orange sm:inline-flex"
          >
            View all products
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Featured mix */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, index) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-brand-tan/50 bg-white transition-shadow hover:shadow-xl"
            >
              <ProductMedia product={p} />

              <div className="flex flex-1 flex-col p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
                  {p.type}
                </span>
                <h3 className="mt-0.5 text-lg font-bold text-brand-brown">{p.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-brand-brown/60">
                  {p.blurb}
                </p>

                <div className="mt-auto flex items-end justify-between pt-5">
                  <div>
                    <span className="text-xs text-brand-brown/50">{p.minNote ?? 'from'}</span>
                    <p className="text-xl font-bold text-brand-orange">
                      ₦{p.price.toLocaleString()}
                      <span className="text-sm font-medium text-brand-brown/50">/{p.unit}</span>
                    </p>
                  </div>
                  <a
                    href={whatsappHref(`Hello Protein Pack! I'd like to order ${p.name}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-brown"
                  >
                    <FaWhatsapp size={15} />
                    Order
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Mobile view-all */}
        <div className="mt-10 flex justify-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border border-brand-brown/20 px-6 py-3 font-semibold text-brand-brown transition-colors hover:border-brand-orange hover:text-brand-orange"
          >
            View all products
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
