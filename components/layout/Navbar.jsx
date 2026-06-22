'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import { products } from '@/data/products';
import { NAV_LINKS, whatsappHref } from '@/lib/site';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const pathname = usePathname();

  const { cart, cartCount, removeFromCart } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsOpen(false);

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  // Over the (dark) hero the bar is transparent → use the light side of the
  // palette. Once scrolled (or the mobile menu is open) the bar is cream → brown.
  const textDark = scrolled || isOpen;

  const cartTotal = Object.entries(cart).reduce((total, [, item]) => {
    const prod = products.find((p) => p.id === item.productId);
    const size = prod?.sizes.find((s) => s.label === item.size);
    return total + (size?.price || 0) * item.quantity;
  }, 0);

  const cartBadge =
    cartCount > 0 ? (
      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-xs font-bold text-white">
        {cartCount}
      </span>
    ) : null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 z-50 h-[12vh] w-full transition-all duration-300 ${
          scrolled ? 'bg-brand-cream/95 shadow-sm backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:grid lg:grid-cols-3 lg:px-12">
          {/* Left — nav links (desktop) */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-base font-semibold transition-colors hover:text-brand-orange ${
                  isActive(item.href)
                    ? 'text-brand-orange'
                    : textDark
                    ? 'text-brand-brown'
                    : 'text-brand-cream'
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-brand-orange" />
                )}
              </Link>
            ))}
          </nav>

          {/* Center — logo */}
          <Link href="/" className="group flex items-center gap-2.5 lg:justify-center">
            <span className="relative h-11 w-11 transition-transform group-hover:scale-105 sm:h-12 sm:w-12">
              <Image src="/assets/Logo.png" alt="Protein Pack" fill className="object-contain" />
            </span>
            <span
              className={`text-xl font-bold tracking-tight sm:text-2xl ${
                textDark ? 'text-brand-brown' : 'text-brand-cream'
              }`}
            >
              Protein Pack
            </span>
          </Link>

          {/* Right — cart + CTA (desktop) / cart + menu (mobile) */}
          <div className="flex items-center justify-end gap-2 sm:gap-4">
            {/* Mobile cart (opens modal) */}
            <button
              onClick={() => setIsCartModalOpen(true)}
              aria-label="Cart"
              className={`relative p-2 transition-colors hover:text-brand-orange lg:hidden ${
                textDark ? 'text-brand-brown' : 'text-brand-cream'
              }`}
            >
              <ShoppingCart size={24} />
              {cartBadge}
            </button>

            {/* Desktop cart (links to /cart) */}
            <Link
              href="/cart"
              aria-label="Cart"
              className={`relative hidden p-2 transition-colors hover:text-brand-orange lg:inline-flex ${
                textDark ? 'text-brand-brown' : 'text-brand-cream'
              }`}
            >
              <ShoppingCart size={24} />
              {cartBadge}
            </Link>

            {/* Desktop CTA */}
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full bg-brand-orange px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-brown lg:flex"
            >
              <FaWhatsapp size={18} />
              Order on WhatsApp
            </a>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen((v) => !v)}
              aria-label="Menu"
              className={`p-2 lg:hidden ${textDark ? 'text-brand-brown' : 'text-brand-cream'}`}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-brand-cream pt-[12vh] lg:hidden">
          <div className="flex flex-col items-center gap-5 py-10">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`text-xl font-semibold transition-colors ${
                  isActive(item.href) ? 'text-brand-orange' : 'text-brand-brown'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="mt-2 flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-brown"
            >
              <FaWhatsapp size={18} />
              Order on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Mobile Cart Modal */}
      {isCartModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 lg:hidden">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-h-[80vh] w-full max-w-sm overflow-hidden rounded-xl bg-white text-brand-brown shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-brand-tan/40 bg-brand-cream px-4 py-3">
              <h2 className="text-lg font-bold">Your Cart ({cartCount} items)</h2>
              <button
                onClick={() => setIsCartModalOpen(false)}
                className="p-1 text-brand-brown/60 transition-colors hover:text-brand-brown"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
              {Object.keys(cart).length === 0 ? (
                <div className="px-4 py-8 text-center text-brand-brown/60">
                  <ShoppingCart size={40} className="mx-auto mb-3 text-brand-tan" />
                  <p className="text-sm">Your cart is empty</p>
                </div>
              ) : (
                Object.entries(cart).map(([key, item]) => {
                  const prod = products.find((p) => p.id === item.productId);
                  const size = prod?.sizes.find((s) => s.label === item.size);
                  if (!prod || !size) return null;

                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 border-b border-brand-tan/30 px-4 py-3 hover:bg-brand-cream/60"
                    >
                      <div className="relative h-12 w-12 flex-shrink-0">
                        <Image src={prod.image} alt={prod.name} fill className="rounded object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{prod.name}</p>
                        <p className="text-xs text-brand-brown/60">
                          {item.size} × {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-brand-orange">
                          ₦{(size.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(key)}
                        className="rounded px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {Object.keys(cart).length > 0 && (
              <div className="border-t border-brand-tan/40 bg-brand-cream px-4 py-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold text-brand-orange">
                    ₦{cartTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/products"
                    onClick={() => setIsCartModalOpen(false)}
                    className="flex-1 rounded-md bg-brand-tan/30 py-2 text-center text-sm font-medium text-brand-brown transition hover:bg-brand-tan/50"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setIsCartModalOpen(false)}
                    className="flex-1 rounded-md bg-brand-orange py-2 text-center text-sm font-bold text-white transition hover:bg-brand-brown"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
}
