"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import { ShoppingCart, Star, X } from "lucide-react";
import { motion } from "framer-motion";
import FAQ from "@/components/sections/FAQSection";
import { useCart } from "../../../contexts/CartContext";

export default function SingleProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Use global cart context
  const { cart, cartCount, addToCart, removeFromCart } = useCart();

  const toggleCartModal = () => {
    setIsCartOpen((prev) => !prev);
  };

  const removeItem = (key) => {
    removeFromCart(key);
  };

  useEffect(() => {
    const found = products.find((p) => p.id === id);
    if (found) {
      setProduct(found);
    } else {
      window.location.href = "/404";
    }
  }, [id]);

  useEffect(() => {
    if (product && selectedSize) {
      const found = product.sizes.find((s) => s.label === selectedSize);
      setPrice(found?.price || 0);
    }
  }, [selectedSize, product]);

  const handleAddToCart = () => {
    if (!selectedSize) return alert("Please select a size");
    addToCart(product.id, selectedSize, quantity, product.name, product.image);
  };

  if (!product) return null;

  const related = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  // Calculate cart total
  const cartTotal = Object.entries(cart).reduce((total, [key, item]) => {
    const prod = products.find((p) => p.id === item.productId);
    const size = prod?.sizes.find((s) => s.label === item.size);
    return total + (size?.price || 0) * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen text-white">
      {/* Banner Section */}
      {product && (
        <section
          className="relative h-[60vh] md:h-[75vh] bg-cover bg-center"
          style={{
            backgroundImage: `url('${product.image}')`,
          }}
        >
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center px-2">
            <h1 className="text-3xl md:text-6xl font-bold text-white drop-shadow-lg">
              Product Image
            </h1>
          </div>
        </section>
      )}

      {/* Intro Text */}
      <section className="py-10 px-2 text-center">
        <p className="max-w-2xl mx-auto text-xl md:text-lg text-gray-300">
          View your product details below and checkout or continue to <br /> 
          <span className="border-b border-yellow-600">
            <a href="/products">build your pack</a>
          </span>
        </p>
      </section>



      {/* Product Detail */}
      <section className="max-w-6xl mx-auto px-2 py-16">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Left: Image */}
          <div className="w-full md:w-1/2">
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-white/20">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
              <span className="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                Available
              </span>
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex-1 space-y-4">
            <span className="bg-yellow-200 text-black px-3 py-1 text-sm font-semibold rounded-full inline-block w-fit">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-white">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-3 text-2xl font-semibold text-white">
              ₦{(price * quantity).toLocaleString()}
              {price > 0 && (
                <span className="text-sm line-through text-gray-500">
                  ₦{Math.round(price * quantity * 1.3).toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-gray-400">{product.description}</p>

            {/* Size Selection */}
            <select
              className="w-full px-2 py-2 border border-white bg-black rounded-md text-white"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              <option value="">Select size</option>
              {product.sizes.map((s) => (
                <option key={s.label} value={s.label}>
                  {s.label} — ₦{s.price.toLocaleString()}
                </option>
              ))}
            </select>

            {/* Quantity */}
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 border border-white text-white text-lg rounded hover:bg-white hover:text-black transition"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-16 text-center py-2 border border-white rounded bg-black text-white"
              />
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 border border-white text-white text-lg rounded hover:bg-white hover:text-black transition"
              >
                +
              </button>
            </div>

            {/* CTA */}
            <button
              onClick={handleAddToCart}
              className="mt-6 w-full py-3 rounded-md bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition"
            >
              Add to Cart
            </button>
          </div>
        </div>
        <br />
        <br />
        <span className="border-b border-yellow-600">
            <a href="/products">Continue to build your pack</a>
          </span>
      </section>

      {/* Related Products */}
      <section className="max-w-6xl mx-auto px-2 pb-20">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-white pb-2">
          Related Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {related.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.id}`}
              className="bg-[#111] border border-white/10 rounded-xl p-4 hover:border-yellow-500 transition"
            >
              <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-white">{item.name}</h3>
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                {item.description}
              </p>
              <p className="mt-2 font-bold text-yellow-500 text-sm">
                ₦{item.sizes[0].price.toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </section>
      
      <FAQ />

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/70 z-[10000] flex items-center justify-center px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white text-black max-w-lg w-full rounded-lg overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-bold">Your Cart ({cartCount} items)</h2>
              <button 
                onClick={toggleCartModal} 
                className="text-gray-500 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="max-h-[60vh] overflow-y-auto">
              {Object.keys(cart).length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                Object.entries(cart).map(([key, item]) => {
                  const prod = products.find((p) => p.id === item.productId);
                  const size = prod?.sizes.find((s) => s.label === item.size);
                  
                  if (!prod || !size) return null;
                  
                  return (
                    <div key={key} className="flex items-center gap-4 px-6 py-4 border-b hover:bg-gray-50">
                      <div className="w-16 h-16 relative flex-shrink-0">
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          fill
                          className="rounded object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{prod.name}</p>
                        <p className="text-sm text-gray-500">
                          Size: {item.size}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-green-600">
                          ₦{(size.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(key)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors px-2 py-1 rounded hover:bg-red-50"
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
              <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-green-600">
                    ₦{cartTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={toggleCartModal}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-md hover:bg-gray-300 transition font-medium"
                  >
                    Continue Shopping
                  </button>
                  <button className="flex-1 bg-yellow-500 text-black py-3 rounded-md hover:bg-yellow-400 transition font-bold">
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}