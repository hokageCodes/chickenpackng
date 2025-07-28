'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { FaEnvelope } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import { products } from '@/data/products';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  // Use global cart context
  const { cart, cartCount, removeFromCart } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/company', label: 'Company' },
    { href: '/cart', label: 'Cart' }, // Desktop only
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const toggleCartModal = () => setIsCartModalOpen(!isCartModalOpen);
  const closeCartModal = () => setIsCartModalOpen(false);

  // Calculate cart total
  const cartTotal = Object.entries(cart).reduce((total, [key, item]) => {
    const prod = products.find((p) => p.id === item.productId);
    const size = prod?.sizes.find((s) => s.label === item.size);
    return total + (size?.price || 0) * item.quantity;
  }, 0);

  const Logo = () => (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative h-12 w-12 sm:h-16 sm:w-16 transition-transform group-hover:scale-105">
        <Image src="/assets/Logo.png" alt="Chicken-Pack" fill className="object-contain" />
      </div>
      <span className={`font-bold text-xl sm:text-2xl lg:text-3xl ${
        scrolled ? 'text-[#3D3C42]' : 'text-white'
      }`}>
        Chicken Pack
      </span>
    </Link>
  );

  return (
    <>
      <header className={`fixed h-[12vh] top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow' : 'bg-transparent'
      }`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-[80px] py-4 flex items-center justify-between">
          <Logo />

          {/* Mobile: Cart Modal Button + Hamburger */}
          <div className="md:hidden flex items-center gap-2 relative">
            <button 
              onClick={toggleCartModal}
              className={`p-2 rounded-full ${scrolled ? 'text-[#3D3C42]' : 'text-white'} relative`}
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button onClick={toggleMenu} className={`p-2 rounded-full ${scrolled ? 'text-[#3D3C42]' : 'text-white'}`}>
              {isOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} className={`font-semibold text-lg ${
                scrolled ? 'text-gray-800' : 'text-white'
              } hover:text-[#7F5283] ${item.href === '/cart' ? 'relative' : ''}`}>
                {item.label}
                {item.href === '/cart' && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            ))}

            <button className="ml-6 flex items-center gap-2 bg-[#500D07] text-white px-4 py-3 rounded-full text-lg font-semibold hover:bg-[#7F5283] transition">
              <FaEnvelope />
              Send A Message
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-[#191919] flex flex-col md:hidden transition-all pt-[12vh]">
          <div className="flex flex-col items-center gap-6 py-10">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="text-white text-xl relative"
              >
                {item.label}
                {item.href === '/cart' && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            ))}

            <button className="flex items-center gap-2 border border-[#7F5283] text-white px-6 py-3 rounded-full hover:bg-[#7F5283]">
              <FaEnvelope />
              Send A Message
            </button>
          </div>
        </div>
      )}

      {/* Mobile Cart Modal - MOBILE ONLY */}
      {isCartModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center px-4 md:hidden">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white text-black max-w-sm w-full rounded-lg overflow-hidden shadow-2xl max-h-[80vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
              <h2 className="text-lg font-bold">Your Cart ({cartCount} items)</h2>
              <button 
                onClick={closeCartModal} 
                className="text-gray-500 hover:text-black transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="max-h-[50vh] overflow-y-auto">
              {Object.keys(cart).length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <ShoppingCart size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Your cart is empty</p>
                </div>
              ) : (
                Object.entries(cart).map(([key, item]) => {
                  const prod = products.find((p) => p.id === item.productId);
                  const size = prod?.sizes.find((s) => s.label === item.size);
                  
                  if (!prod || !size) return null;
                  
                  return (
                    <div key={key} className="flex items-center gap-3 px-4 py-3 border-b hover:bg-gray-50">
                      <div className="w-12 h-12 relative flex-shrink-0">
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          fill
                          className="rounded object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{prod.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.size} × {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-green-600">
                          ₦{(size.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(key)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors px-2 py-1 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {Object.keys(cart).length > 0 && (
              <div className="px-4 py-3 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold text-green-600">
                    ₦{cartTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={closeCartModal}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition font-medium text-sm"
                  >
                    <a href="/products">Continue Shopping</a>
                  </button>
                  <Link 
                    legacyBehavior
                    href="/cart"
                    onClick={closeCartModal}
                    className="flex-1 bg-[#500D07] text-white py-2 rounded-md hover:bg-[#7F5283] transition font-bold text-center text-sm"
                  >
                    <a href="/cart">View Cart</a>
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