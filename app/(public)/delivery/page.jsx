"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, MessageCircle, Wallet } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import { whatsappHref } from "@/lib/site";
import CTASection from "@/components/sections/CTASection";

// Placeholder zones, edit fees / areas / ETA here (or wire to DeliveryZone later).
const zones = [
  {
    name: "Lagos Mainland",
    areas: "Yaba, Surulere, Ikeja, Maryland, Gbagada, Ojota and nearby areas.",
    fee: 2500,
    minOrder: 10000,
    eta: "Same day",
  },
  {
    name: "Lagos Island",
    areas: "Lekki, Victoria Island, Ikoyi, Ajah and nearby areas.",
    fee: 3500,
    minOrder: 15000,
    eta: "Same day / next day",
  },
  {
    name: "Outside Lagos",
    areas: "Ogun, Ibadan and beyond, by arrangement.",
    fee: null,
    minOrder: 50000,
    eta: "Scheduled",
  },
];

const steps = [
  {
    icon: Clock,
    title: "Order before 12 noon",
    text: "Place your order before midday to catch same-day delivery. Later orders go out the next day.",
  },
  {
    icon: MessageCircle,
    title: "We confirm your slot",
    text: "We reach out on WhatsApp to confirm your items, address and delivery window.",
  },
  {
    icon: Wallet,
    title: "Pay your way",
    text: "Pay online with Paystack, by bank transfer, or with cash when your order arrives.",
  },
];

const formatFee = (fee) => (fee === null ? "On request" : `₦${fee.toLocaleString()}`);

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section
        className="relative flex min-h-[70vh] w-full items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/enjoy.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-brand-brown/60 via-brand-brown/35 to-brand-brown/70" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-[12vh] text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-peach">
            Delivery
          </span>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-brand-cream md:text-6xl lg:text-7xl">
            Fresh to your door
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-brand-cream/70 sm:text-lg">
            Same-day and scheduled delivery across Lagos, with pay-on-delivery available on every
            order.
          </p>
        </div>
      </section>

      {/* Zones */}
      <section className="bg-white px-4 py-16 sm:px-10 sm:py-24 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 text-center sm:mb-14">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
              Coverage
            </span>
            <h2 className="mt-2 text-3xl font-bold text-brand-brown sm:text-4xl lg:text-5xl">
              Zones &amp; fees
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-brown/60">
              Fees and minimums vary by area. Not sure where you fall? Just ask us.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {zones.map((zone, i) => (
              <motion.div
                key={zone.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="flex flex-col rounded-3xl border border-brand-tan/50 bg-brand-cream p-7"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-orange text-white">
                    <MapPin size={20} />
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-brown ring-1 ring-brand-tan/60">
                    {zone.eta}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-bold text-brand-brown">{zone.name}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-brand-brown/60">
                  {zone.areas}
                </p>

                <dl className="mt-5 space-y-2 border-t border-brand-tan/50 pt-5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-brand-brown/60">Delivery fee</dt>
                    <dd className="font-bold text-brand-orange">{formatFee(zone.fee)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-brand-brown/60">Min order</dt>
                    <dd className="font-semibold text-brand-brown">
                      ₦{zone.minOrder.toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href={whatsappHref("Hello Protein Pack! Do you deliver to my area?")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-7 py-3.5 font-semibold text-white transition-colors hover:bg-brand-brown"
            >
              <FaWhatsapp size={18} />
              Confirm your area
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-brand-cream px-4 py-16 sm:px-10 sm:py-24 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 text-center sm:mb-14">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
              How it works
            </span>
            <h2 className="mt-2 text-3xl font-bold text-brand-brown sm:text-4xl lg:text-5xl">
              From order to doorstep
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="rounded-2xl border border-brand-tan/50 bg-white p-7"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-orange text-white">
                      <Icon size={20} />
                    </span>
                    <span className="text-sm font-bold text-brand-peach">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-brand-brown">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-brand-brown/60">{step.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
