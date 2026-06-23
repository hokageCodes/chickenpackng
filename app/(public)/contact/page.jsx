"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import { SITE, whatsappHref } from "@/lib/site";

const methods = [
  {
    icon: FaWhatsapp,
    label: "WhatsApp",
    value: "Chat with us",
    href: whatsappHref(),
    external: true,
  },
  {
    icon: Phone,
    label: "Call",
    value: `+${SITE.whatsapp}`,
    href: `tel:+${SITE.whatsapp}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@proteinpack.ng",
    href: "mailto:hello@proteinpack.ng",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Lagos, Nigeria",
  },
  {
    icon: Clock,
    label: "Opening hours",
    value: "Mon to Sat, 8am to 6pm",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const lines = [
      "Hello Protein Pack!",
      form.name && `My name is ${form.name}.`,
      form.message,
      form.phone && `(You can reach me on ${form.phone})`,
    ].filter(Boolean);
    window.open(whatsappHref(lines.join(" ")), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section
        className="relative flex min-h-[70vh] w-full items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/3.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-brand-brown/60 via-brand-brown/35 to-brand-brown/70" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-[12vh] text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-peach">
            Contact
          </span>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-brand-cream md:text-6xl lg:text-7xl">
            Get in touch
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-brand-cream/70 sm:text-lg">
            Questions, bulk orders or just want to say hello? We are always a message away.
          </p>
        </div>
      </section>

      {/* Methods + form */}
      <section className="px-4 py-16 sm:px-10 sm:py-24 lg:px-16">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Methods */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
              Reach us
            </span>
            <h2 className="mt-2 text-3xl font-bold text-brand-brown sm:text-4xl">
              Talk to a real person
            </h2>
            <p className="mt-3 max-w-md text-brand-brown/60">
              WhatsApp is the fastest way to order or get an answer, but pick whatever works for you.
            </p>

            <ul className="mt-8 space-y-3">
              {methods.map((m) => {
                const Icon = m.icon;
                const content = (
                  <span className="flex items-center gap-4 rounded-2xl border border-brand-tan/50 bg-white p-4 transition-colors hover:border-brand-orange">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                      <Icon size={20} />
                    </span>
                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-brand-brown/50">
                        {m.label}
                      </span>
                      <span className="block font-semibold text-brand-brown">{m.value}</span>
                    </span>
                  </span>
                );
                return (
                  <li key={m.label}>
                    {m.href ? (
                      <a
                        href={m.href}
                        target={m.external ? "_blank" : undefined}
                        rel={m.external ? "noopener noreferrer" : undefined}
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Form */}
          <div className="rounded-3xl border border-brand-tan/50 bg-white p-7 sm:p-9">
            <h3 className="text-2xl font-bold text-brand-brown">Send us a message</h3>
            <p className="mt-1.5 text-sm text-brand-brown/60">
              Fill this in and it opens WhatsApp with your message ready to send.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-brand-brown">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-brand-tan/70 px-4 py-2.5 text-brand-brown outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-brand-brown">
                  Phone <span className="text-brand-brown/40">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="080..."
                  className="w-full rounded-lg border border-brand-tan/70 px-4 py-2.5 text-brand-brown outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-brand-brown">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="What would you like to order or ask?"
                  className="w-full resize-none rounded-lg border border-brand-tan/70 px-4 py-2.5 text-brand-brown outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange py-3.5 font-semibold text-white transition-colors hover:bg-brand-brown"
              >
                <Send size={18} />
                Send on WhatsApp
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="px-4 pb-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1440px] overflow-hidden rounded-3xl ring-1 ring-brand-tan/40">
          <iframe
            title="Protein Pack location"
            src="https://www.google.com/maps?q=Lagos,Nigeria&output=embed"
            className="h-[360px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  );
}
