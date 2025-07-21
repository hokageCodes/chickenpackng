'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="border-gray-200 py-14 px-2 sm:px-8 mt-24 md:pl-32">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-[#3D3C42]">

        {/* Logo and Description */}
        <div className="flex flex-col items-start">
          <Link href="/" className="flex items-center gap-4 mb-5">
            <div className="relative h-14 w-14">
              <Image src="/assets/Logo.png" alt="Chicken Pack Logo" fill className="object-contain" />
            </div>
            <span className="text-2xl font-bold">Chicken Pack</span>
          </Link>
          <p className="text-base text-gray-700 leading-relaxed max-w-sm">
            Fresh. Tasty. Affordable. We deliver chicken goodness straight to your doorstep.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-xl mb-5 text-[#7F5283]">Quick Links</h4>
          <ul className="space-y-4 text-lg">
            <li><Link href="/" className="hover:text-[#7F5283]">Home</Link></li>
            <li><Link href="#products" className="hover:text-[#7F5283]">Products</Link></li>
            <li><Link href="#blog" className="hover:text-[#7F5283]">Blog</Link></li>
            <li><Link href="#company" className="hover:text-[#7F5283]">Company</Link></li>
          </ul>
        </div>

        {/* Contact Info with Icons */}
        <div>
          <h4 className="font-semibold text-xl mb-5 text-[#7F5283]">Contact Us</h4>
          <ul className="space-y-4 text-lg">
            <li className="flex items-center gap-3">
              <FiMail className="text-[#7F5283]" />
              <a href="mailto:support@chickenpack.com" className="hover:text-[#7F5283]">support@chickenpack.com</a>
            </li>
            <li className="flex items-center gap-3">
              <FiPhone className="text-[#7F5283]" />
              <a href="tel:+2348000000000" className="hover:text-[#7F5283]">+234 800 000 0000</a>
            </li>
            <li className="flex items-center gap-3">
              <FiMapPin className="text-[#7F5283]" />
              <span>Lagos, Nigeria</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="text-center text-base text-gray-600 mt-14">
        © 2025 Chicken Pack. All rights reserved.
      </div>
    </footer>
  );
}
