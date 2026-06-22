'use client';
import { motion } from 'framer-motion';
import { CreditCard, Truck, BadgeCheck, Gift } from 'lucide-react';

const PERKS = [
  {
    icon: CreditCard,
    title: 'Multiple Payment Options',
    description: 'Pay your way — bank transfer, pay-on-delivery cash, or online with Paystack.',
  },
  {
    icon: Truck,
    title: 'Fast Lagos Delivery',
    description: 'Same-day and scheduled drops across the mainland and island.',
  },
  {
    icon: BadgeCheck,
    title: 'Farm-Fresh Quality',
    description: 'Straight from our farm — clean, fresh, and never compromised.',
  },
  {
    icon: Gift,
    title: 'Bundles & Bonuses',
    description: 'Curated value packs and special offers for bulk and gifting.',
  },
];

export default function PerksSection() {
  return (
    <section className="bg-brand-cream py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-10 lg:px-16">
        {/* Eyebrow + heading */}
        <div className="mb-10 text-center sm:mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
            Why Protein Pack
          </span>
          <h2 className="mt-2 text-3xl font-bold text-brand-brown sm:text-4xl">
            Fresh protein, made easy
          </h2>
        </div>

        {/* Perk cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((perk, index) => {
            const Icon = perk.icon;
            return (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group rounded-2xl border border-brand-tan/50 bg-white p-6 transition-shadow hover:shadow-lg"
              >
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange transition-colors group-hover:bg-brand-orange group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-bold text-brand-brown">{perk.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-brand-brown/60">
                  {perk.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
