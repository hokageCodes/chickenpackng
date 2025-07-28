"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

import { products } from "@/data/products";
import FAQ from "@/components/sections/FAQSection";
import { useCart } from "../../contexts/CartContext";

const categories = ["Full", "Laps", "Chest Wings"];
const sizes = ["1kg", "2kg", "5kg"];

export default function ProductPage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { addToCart } = useCart();
  const [selection, setSelection] = useState({});

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    const matchesSize = selectedSize
      ? product.sizes.some((s) => s.label === selectedSize)
      : true;
    const matchesSearch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSize && matchesSearch;
  });

  const handleSelectionChange = (productId, field, value) => {
    setSelection((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleAdd = (product) => {
    const item = selection[product.id];
    if (!item?.size || !item?.quantity) {
      alert("Select size and quantity");
      return;
    }
    addToCart(product.id, item.size, item.quantity, product.name, product.image);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedSize("");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen">
      <section
        className="relative h-[60vh] md:h-[75vh] w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/2.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center px-4 text-center">
          <h1 className="text-3xl md:text-7xl font-bold text-white leading-tight max-w-5xl">
            Welcome To Our Coop
          </h1>
        </div>
      </section>

      <section className="py-10 px-2 md:px-16 text-center">
        <p className="max-w-2xl mx-auto text-lg text-gray-400">
          Chicken Pack specializes in providing high-quality, fresh broiler meat and eggs to households,
          restaurants, and businesses. Our mission is to deliver fresh, healthy, and affordable poultry
          products while maintaining the highest standards of quality and hygiene.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-1/4 bg-white rounded-xl shadow-md border px-6 py-8 space-y-8 h-fit lg:sticky lg:top-28">
            <h3 className="text-xl font-bold text-[#7F5283] border-b pb-3">Filter Products</h3>
            <div className="space-y-1">
              <label htmlFor="search" className="text-sm font-medium text-gray-600">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">Category</h4>
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                    className="accent-black"
                  />
                  {cat}
                </label>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">Size</h4>
              {sizes.map((size) => (
                <label key={size} className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="radio"
                    name="size"
                    checked={selectedSize === size}
                    onChange={() => setSelectedSize(size)}
                    className="accent-black"
                  />
                  {size}
                </label>
              ))}
            </div>

            {(selectedCategory || selectedSize || searchTerm) && (
              <button onClick={clearFilters} className="text-sm text-red-600 hover:underline">
                Clear All Filters
              </button>
            )}
          </aside>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={300}
                  className="w-full h-56 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-bold text-[#7F5283] mb-1">{product.name}</h2>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                  <Link
                    href={`/products/${product.id}`}
                    className="inline-block w-full text-center mb-3 py-2 px-3 border border-[#7F5283] text-[#7F5283] font-semibold rounded-md hover:bg-[#7F5283] hover:text-white transition-colors"
                  >
                    View Product
                  </Link>

                  <select
                    className="w-full mb-3 px-3 py-2 border rounded-md"
                    defaultValue=""
                    onChange={(e) =>
                      handleSelectionChange(product.id, "size", e.target.value)
                    }
                  >
                    <option value="" disabled>Choose size</option>
                    {product.sizes.map((s) => (
                      <option key={s.label} value={s.label}>
                        {s.label} — ₦{s.price.toLocaleString()}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    defaultValue="1"
                    onChange={(e) =>
                      handleSelectionChange(product.id, "quantity", parseInt(e.target.value) || 1)
                    }
                    className="w-full px-3 py-2 border rounded-md text-center mb-3"
                  />

                  <button
                    onClick={() => handleAdd(product)}
                    className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-900"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-20">
                <p className="text-2xl font-semibold">No products found</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <FAQ />
    </div>
  );
}