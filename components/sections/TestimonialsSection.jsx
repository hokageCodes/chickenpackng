'use client';

import { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

// Placeholder testimonials, swap for real customer quotes when available.
const testimonials = [
  {
    text: 'Their frozen chicken is always clean and properly cut. My kitchen has used Protein Pack for months and the quality never drops.',
    name: 'Chinwe Okafor',
    role: 'Restaurant Owner',
    rating: 5,
  },
  {
    text: 'I order a crate of eggs every week and it arrives the same day, fresh, never cracked. Exactly what a busy home needs.',
    name: 'Tunde Bakare',
    role: 'Home Customer',
    rating: 5,
  },
  {
    text: 'The smoked catfish is rich and ready to cook. My customers can taste the difference at every event.',
    name: 'Amaka Eze',
    role: 'Caterer',
    rating: 5,
  },
  {
    text: 'As a distributor I need reliable bulk supply. Their live birds come healthy and on time, every single order.',
    name: 'Ibrahim Sani',
    role: 'Distributor',
    rating: 5,
  },
  {
    text: 'Ordering on WhatsApp is so easy. I message them, pay on delivery, and my chicken shows up the same day.',
    name: 'Bisi Adeyemi',
    role: 'Office Admin',
    rating: 5,
  },
  {
    text: 'Fair prices, honest weight and proper hygiene. Protein Pack is our go-to for poultry and fish now.',
    name: 'Gozie Nwosu',
    role: 'Event Planner',
    rating: 5,
  },
];

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? 'fill-brand-orange text-brand-orange' : 'text-brand-tan'}
        />
      ))}
    </div>
  );
}

function initials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('');
}

export default function TestimonialsCarousel() {
  const trackRef = useRef(null);

  const scrollByCard = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('[data-card]');
    const amount = card ? card.offsetWidth + 24 : track.clientWidth;

    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    const atStart = track.scrollLeft <= 8;

    if (dir > 0 && atEnd) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (dir < 0 && atStart) {
      track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: dir * amount, behavior: 'smooth' });
    }
  };

  // Auto-advance
  useEffect(() => {
    const id = setInterval(() => scrollByCard(1), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="bg-brand-brown py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-peach">
              Loved across Lagos
            </span>
            <h2 className="mt-2 text-3xl font-bold text-brand-cream sm:text-4xl lg:text-5xl">
              What our customers say
            </h2>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => scrollByCard(-1)}
              aria-label="Previous"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-cream/30 text-brand-cream transition-colors hover:border-brand-orange hover:bg-brand-orange hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollByCard(1)}
              aria-label="Next"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-cream/30 text-brand-cream transition-colors hover:border-brand-orange hover:bg-brand-orange hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {testimonials.map((t, i) => (
            <figure
              key={i}
              data-card
              className="flex w-[85%] shrink-0 snap-start flex-col rounded-2xl bg-brand-cream p-7 sm:w-[400px]"
            >
              <div className="flex items-center justify-between">
                <Stars rating={t.rating} />
                <Quote size={32} className="text-brand-orange/20" />
              </div>

              <blockquote className="mt-4 flex-1 leading-relaxed text-brand-brown/80">
                “{t.text}”
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-brand-tan/40 pt-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-orange text-sm font-bold text-white">
                  {initials(t.name)}
                </span>
                <div>
                  <p className="font-bold text-brand-brown">{t.name}</p>
                  <p className="text-sm text-brand-brown/60">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
