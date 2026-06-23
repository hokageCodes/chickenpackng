"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, Target } from "lucide-react";

import FAQ from "@/components/sections/FAQSection";
import CTASection from "@/components/sections/CTASection";

const founders = [
  {
    name: "Abiodun Young",
    role: "Founder",
    quote: "Excellence in execution turns bold visions into everyday reality.",
    image: null,
  },
];

const galleryImages = [
  { src: "/assets/farm.jpg", alt: "Our farm" },
  { src: "/assets/hen.webp", alt: "Healthy live birds" },
  { src: "/assets/raw.jpg", alt: "Freshly processed chicken" },
  { src: "/assets/enjoy.jpg", alt: "Ready to enjoy" },
  { src: "/assets/1.jpg", alt: "Farm life" },
  { src: "/assets/2.jpg", alt: "Inside the farm" },
  { src: "/assets/3.jpg", alt: "On the farm" },
  { src: "/assets/ken.jpg", alt: "Our produce" },
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
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-brand-orange text-lg font-bold text-white">
      {initials}
    </span>
  );
}

export default function FarmPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section
        className="relative flex min-h-[70vh] w-full items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/farm.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-brand-brown/60 via-brand-brown/35 to-brand-brown/70" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-[12vh] text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-peach">
            Our Farm
          </span>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-brand-cream md:text-6xl lg:text-7xl">
            Where it all begins
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-brand-cream/70 sm:text-lg">
            Sinum Agro Food Technology, a Lagos poultry and catfish farm raising the protein
            that ends up on your table.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="px-4 py-16 sm:px-10 sm:py-24 lg:px-16">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative order-last aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-brand-tan/40 lg:order-first"
          >
            <Image src="/assets/hen.webp" alt="Our farm" fill className="object-cover" />
          </motion.div>

          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
              Our Story
            </span>
            <h2 className="mt-2 text-3xl font-bold text-brand-brown sm:text-4xl lg:text-5xl">
              Honest protein, raised the right way
            </h2>
            <div className="mt-5 space-y-4 text-brand-brown/70">
              <p>
                Sinum Agro Food Technology started with a small flock and two catfish ponds, built
                on a simple belief: everyone deserves fresh, honest protein at a fair price.
              </p>
              <p>
                Today we raise broilers and catfish, process to order, and deliver chicken, fish and
                eggs across Lagos. We control the journey from pen to pack, so quality and hygiene
                never get left to chance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white px-4 py-16 sm:px-10 sm:py-24 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 text-center sm:mb-14">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
              What drives us
            </span>
            <h2 className="mt-2 text-3xl font-bold text-brand-brown sm:text-4xl lg:text-5xl">
              Mission &amp; Vision
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-brand-tan/50 bg-brand-cream p-8 sm:p-10">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange text-white">
                <Eye size={26} />
              </span>
              <h3 className="mt-5 text-2xl font-bold text-brand-brown">Our Vision</h3>
              <p className="mt-3 leading-relaxed text-brand-brown/70">
                To be the most trusted source of farm-fresh protein in Lagos, ensuring quality,
                affordability and strict hygiene in every order, while growing sustainable farming
                the right way.
              </p>
            </div>

            <div className="rounded-3xl border border-brand-tan/50 bg-brand-cream p-8 sm:p-10">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange text-white">
                <Target size={26} />
              </span>
              <h3 className="mt-5 text-2xl font-bold text-brand-brown">Our Mission</h3>
              <p className="mt-3 leading-relaxed text-brand-brown/70">
                To make nutritious, farm-fresh chicken, fish and eggs accessible to every home and
                business, setting the standard for quality, honesty and service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="bg-brand-cream px-4 py-16 sm:px-10 sm:py-24 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 text-center sm:mb-12">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
              The person behind it
            </span>
            <h2 className="mt-2 text-3xl font-bold text-brand-brown sm:text-4xl">
              Meet the founder
            </h2>
          </div>

          <div className="mx-auto grid max-w-md gap-6">
            {founders.map((f, i) => (
              <motion.figure
                key={f.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
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
      </section>

      {/* Gallery */}
      <section className="bg-brand-brown px-4 py-16 sm:px-10 sm:py-24 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-peach">
              Gallery
            </span>
            <h2 className="mt-2 text-3xl font-bold text-brand-cream sm:text-4xl lg:text-5xl">
              Life on the farm
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {galleryImages.map((img, index) => (
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

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <CTASection />
    </div>
  );
}
