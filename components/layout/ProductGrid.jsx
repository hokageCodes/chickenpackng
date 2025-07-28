'use client';

import { useState } from 'react';
import Image from 'next/image';
import { products } from '../../data/products';
import { useCart } from '../../contexts/CartContext';

const categories = ['All', 'Full', 'Laps', 'Chest Wings'];

export default function ProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSizes, setSelectedSizes] = useState({});
  const [quantities, setQuantities] = useState({});

  // Use global cart context
  const { addToCart } = useCart();

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleSizeChange = (productId, sizeLabel) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: sizeLabel }));
  };

  const handleQuantityChange = (productId, quantity) => {
    setQuantities((prev) => ({ ...prev, [productId]: quantity }));
  };

  const handleAddToCart = (product) => {
    const selectedSize = selectedSizes[product.id] || product.sizes[0].label;
    const quantity = quantities[product.id] || 1;
    
    addToCart(product.id, selectedSize, quantity, product.name, product.image);
    
    // Reset quantity after adding
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

  return (
    <section className="px-4 py-12 md:px-16 bg-[#FEFBF6] min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-10">Shop Fresh Chicken</h2>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-[#500D07] text-white'
                : 'bg-white border border-gray-300 text-gray-800'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => {
          const selectedSize =
            selectedSizes[product.id] || product.sizes[0].label;
          const selectedPrice =
            product.sizes.find((s) => s.label === selectedSize)?.price || 0;
          const quantity = quantities[product.id] || 1;

          return (
            <div
              key={product.id}
              className="bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="relative h-52 w-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                />
              </div>

              <div className="p-5 flex flex-col flex-grow justify-between">
                <h3 className="text-lg font-semibold text-[#3D3C42] mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {product.description}
                </p>

                {/* Size Selector */}
                <select
                  value={selectedSize}
                  onChange={(e) =>
                    handleSizeChange(product.id, e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm mb-4"
                >
                  {product.sizes.map((size) => (
                    <option key={size.label} value={size.label}>
                      {size.label}
                    </option>
                  ))}
                </select>

                {/* Quantity Selector */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => handleQuantityChange(product.id, Math.max(1, quantity - 1))}
                    className="w-8 h-8 border border-gray-300 rounded-full text-sm hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                    className="w-16 text-center py-1 border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={() => handleQuantityChange(product.id, quantity + 1)}
                    className="w-8 h-8 border border-gray-300 rounded-full text-sm hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-[#500D07] font-bold text-lg">
                    ₦{(selectedPrice * quantity).toLocaleString()}
                  </div>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="bg-[#500D07] text-white px-4 py-2 rounded-full text-sm hover:bg-[#6a1811] transition"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}