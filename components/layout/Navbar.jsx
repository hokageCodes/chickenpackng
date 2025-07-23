'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { FaEnvelope } from 'react-icons/fa';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/company', label: 'Company' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    // Close mobile menu on window resize (desktop/mobile switch)
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsOpen(false);
      }
    };

    // Close mobile menu on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Toggle mobile menu
  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  // Close mobile menu
  const closeMenu = () => {
    setIsOpen(false);
  };

  // Unified Logo Component
  const Logo = ({ onClick, isMobile = false }) => (
    <Link 
      href="/" 
      className="flex items-center gap-3 sm:gap-4 group" 
      onClick={onClick}
    >
      <div className={`relative transition-transform duration-300 group-hover:scale-105 ${
        isMobile ? 'h-14 w-14' : 'h-12 w-12 sm:h-16 sm:w-16'
      }`}>
        <Image
          src="/assets/Logo.png"
          alt="Chicken-Pack"
          fill
          sizes="(max-width: 768px) 56px, 64px"
          className="object-contain"
          priority
        />
      </div>
      <span className={`font-bold leading-tight transition-all duration-300 ${
        scrolled 
          ? 'text-[#3D3C42] group-hover:text-[#7F5283]' 
          : 'text-white group-hover:text-white/90'
      } ${
        isMobile ? 'text-xl' : 'text-xl sm:text-2xl lg:text-3xl'
      }`}>
        Chicken Pack
      </span>
    </Link>
  );

  return (
    <>
      <header
        className={`fixed h-[12vh] top-0 left-0 w-full z-50 transition-all duration-500 ease-out ${
          scrolled 
            ? 'backdrop-blur-lg bg-white/90 shadow-xl' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto sm:px-[80px] py-4 sm:py-4 flex items-center justify-between">
          {/* Logo - Only show when mobile menu is closed */}
          <div className={`transition-opacity duration-300 ${isOpen ? 'md:opacity-100 opacity-0' : 'opacity-100'}`}>
            <Logo onClick={closeMenu} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10 lg:gap-12">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-lg lg:text-xl font-semibold transition-all duration-300 hover:scale-105 relative group ${
                  scrolled 
                    ? 'text-gray-700 hover:text-[#7F5283]' 
                    : 'text-white hover:text-white/90'
                }`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                  scrolled ? 'bg-[#7F5283]' : 'bg-white'
                }`}></span>
              </Link>
            ))}

            <button
              type="button"
              className="ml-6 flex items-center gap-3 bg-[#500D07] text-white px-4 py-3 lg:px-4 lg:py-2 rounded-full font-semibold text-lg lg:text-lg hover:bg-[#7F5283] hover:shadow-xl transition-all duration-300 hover:scale-105 transform"
              style={{ color: 'white' }}
            >
              <FaEnvelope size={20} className="text-white" />
              Send A Message
            </button>
          </nav>

          {/* Mobile Menu Toggle - Fixed Toggle Logic */}
          <button
            onClick={toggleMenu}
            className={`md:hidden p-4 rounded-full transition-all duration-300 hover:scale-110 transform relative overflow-hidden ${
              scrolled 
                ? 'text-[#7F5283] hover:bg-[#7F5283]/10' 
                : 'text-white hover:bg-white/10'
            }`}
            aria-expanded aria-label={isOpen ? "Close menu" : "Open menu"}
            type="button"
          >
            <div className="relative w-9 h-9 flex items-center justify-center">
              {/* Hamburger Icon */}
              <Menu 
                size={36} 
                className={`absolute transition-all duration-300 ease-in-out transform ${
                  isOpen 
                    ? 'rotate-90 scale-0 opacity-0' 
                    : 'rotate-0 scale-100 opacity-100'
                }`}
              />
              {/* X Icon */}
              <X 
                size={32} 
                className={`absolute transition-all duration-300 ease-in-out transform ${
                  isOpen 
                    ? 'rotate-0 scale-100 opacity-100' 
                    : '-rotate-90 scale-0 opacity-0'
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-white transition-all duration-300 ease-out flex flex-col md:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={closeMenu} // Close when clicking overlay background
      >
        {/* Mobile Menu Header with Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          {/* Logo in mobile menu */}
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12">
              <Image
                src="/assets/Logo.png"
                alt="Chicken-Pack"
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-[#3D3C42]">
              Chicken Pack
            </span>
          </div>
          
          <button
            onClick={closeMenu}
            className="text-[#7F5283] p-2 rounded-full hover:bg-[#7F5283]/10 transition-all duration-300"
            aria-label="Close menu"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div 
          className="flex-1 flex flex-col"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking menu content
        >
          <nav className="flex flex-col justify-center flex-1 space-y-8 text-center px-6">
            {navLinks.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`text-2xl text-[#3D3C42] font-medium hover:text-[#7F5283] transition-all duration-300 transform hover:scale-105 ${
                  isOpen ? 'animate-fade-in-up' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={closeMenu}
              className={`mt-8 self-center inline-flex items-center justify-center gap-2 border border-[#7F5283] text-[#7F5283] px-8 py-4 rounded-full font-medium hover:bg-[#7F5283] hover:text-white transition-all duration-300 hover:scale-105 ${
                isOpen ? 'animate-fade-in-up' : ''
              }`}
              style={{ animationDelay: `${navLinks.length * 100}ms` }}
            >
                <FaEnvelope size={20} className="text-white" />
                Send A Message
            </button>
          </nav>

          <div className="text-center text-sm text-gray-400 pb-6 mt-auto">
            © 2025 Chicken Pack
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </>
  );
}