'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sprout, Snowflake, Truck } from 'lucide-react';

const highlights = [
  { icon: Sprout, label: 'Farm-direct, no middlemen' },
  { icon: Snowflake, label: 'Never long-frozen stock' },
  { icon: Truck, label: 'Lagos-wide delivery' },
];

const founders = [
  {
    name: 'Abiodun Young',
    role: 'Co-Founder',
    quote: 'Excellence in execution turns bold visions into everyday reality.',
    image: null,
  },
  {
    name: 'Philip Omoike',
    role: 'Co-Founder',
    quote: 'Innovation is about reimagining how we feed our communities sustainably.',
    image: null,
  },
];

function Avatar({ name, image }) {
  if (image) {
    return (
      <span className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full">
        <Image src={image} alt={name} fill className="object-cover" />
      </span>
    );
  }
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
  return (
    <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-brand-orange text-lg font-bold text-white">
      {initials}
    </span>
  );
}

export default function OurOriginSection() {
  return (
    <section className="bg-brand-cream py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-10 lg:px-16">
        {/* Origin story */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="relative order-last aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-brand-tan/40 lg:order-first"
          >
            <Image src="/assets/2.jpg" alt="Our farm" fill className="object-cover" />
          </motion.div>

          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
              Our Origin
            </span>
            <h2 className="mt-2 text-3xl font-bold text-brand-brown sm:text-4xl lg:text-5xl">
              Born on the farm, built for your table
            </h2>
            <div className="mt-5 space-y-4 text-brand-brown/70">
              <p>
                Protein Pack is the storefront of <strong className="text-brand-brown">Sinum Agro
                Food Technology</strong>, a Lagos poultry and catfish farm built on a simple belief:
                everyone deserves fresh, honest protein at a fair price.
              </p>
              <p>
                What started as a small flock and two ponds has grown into a farm that raises,
                processes and delivers chicken, fish and eggs, straight from our pens to your
                kitchen, with no middlemen in between.
              </p>
            </div>

            <ul className="mt-6 flex flex-wrap gap-3">
              {highlights.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-brown ring-1 ring-brand-tan/50"
                >
                  <Icon size={16} className="text-brand-orange" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Founders */}
        <div className="mt-16 sm:mt-24">
          <div className="mb-8 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
              The people behind it
            </span>
            <h3 className="mt-2 text-2xl font-bold text-brand-brown sm:text-3xl">
              Meet the founders
            </h3>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {founders.map((f, i) => (
              <motion.figure
                key={f.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-brand-tan/50 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <Avatar name={f.name} image={f.image} />
                  <figcaption>
                    <p className="text-lg font-bold text-brand-brown">{f.name}</p>
                    <p className="text-sm font-semibold text-brand-orange">{f.role}</p>
                  </figcaption>
                </div>
                <blockquote className="mt-4 italic leading-relaxed text-brand-brown/60">
                  “{f.quote}”
                </blockquote>
              </motion.figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
