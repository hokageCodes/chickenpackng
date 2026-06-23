'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { SITE, NAV_LINKS, whatsappHref } from '@/lib/site';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-tan/50 bg-white text-brand-brown/70">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-10 lg:px-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="relative h-12 w-12">
                <Image src="/assets/Logo.png" alt="Protein Pack" fill className="object-contain" />
              </span>
              <span className="text-xl font-bold text-brand-brown">Protein Pack</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Farm-fresh chicken, fish and eggs, raised, processed and delivered across Lagos.
            </p>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-brown"
            >
              <FaWhatsapp size={16} />
              Order on WhatsApp
            </a>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
              Explore
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-brand-orange">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
              Contact
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <MapPin size={16} className="flex-shrink-0 text-brand-orange" />
                Lagos, Nigeria
              </li>
              <li>
                <a
                  href={`tel:+${SITE.whatsapp}`}
                  className="flex items-center gap-3 transition-colors hover:text-brand-orange"
                >
                  <Phone size={16} className="flex-shrink-0 text-brand-orange" />
                  +{SITE.whatsapp}
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@proteinpack.ng"
                  className="flex items-center gap-3 transition-colors hover:text-brand-orange"
                >
                  <Mail size={16} className="flex-shrink-0 text-brand-orange" />
                  hello@proteinpack.ng
                </a>
              </li>
              <li>
                <a
                  href={whatsappHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 transition-colors hover:text-brand-orange"
                >
                  <FaWhatsapp size={16} className="flex-shrink-0 text-brand-orange" />
                  Chat with us
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
              Opening hours
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex justify-between gap-4">
                <span>Mon to Fri</span>
                <span className="text-brand-brown/50">8am to 6pm</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Saturday</span>
                <span className="text-brand-brown/50">9am to 5pm</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Sunday</span>
                <span className="text-brand-brown/50">Closed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-brand-tan/50 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            © {year} Protein Pack, Sinum Agro Food Technology. All rights reserved.
          </p>
          <p className="text-xs text-brand-brown/40">Fresh from our farm to your table.</p>
        </div>
      </div>
    </footer>
  );
}
