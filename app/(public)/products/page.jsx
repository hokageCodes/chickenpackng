"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Drumstick, Fish, Egg } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import { popularProducts, PRODUCT_TYPES } from "@/data/popular";
import { whatsappHref } from "@/lib/site";
import FAQ from "@/components/sections/FAQSection";

const FORMS = ["All", "Live", "Processed", "Fresh"];

const TYPE_ICON = { Chicken: Drumstick, Fish: Fish, Eggs: Egg };
const FORM_BADGE = {
  Live: "bg-brand-brown text-white",
  Processed: "bg-brand-orange text-white",
  Fresh: "bg-brand-peach text-brand-brown",
};

function ProductMedia({ product }) {
  const Icon = TYPE_ICON[product.type] ?? Drumstick;
  return (
    <div className="relative aspect-[4/3] overflow-hidden">
      {product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-cream to-brand-tan/50">
          <Icon className="h-12 w-12 text-brand-brown/30" />
          <span className="text-xs font-medium text-brand-brown/40">Photo coming soon</span>
        </div>
      )}
      <span
        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${FORM_BADGE[product.form]}`}
      >
        {product.form}
      </span>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand-tan/50 bg-white transition-shadow hover:shadow-xl"
    >
      <ProductMedia product={product} />

      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
          {product.type}
        </span>
        <h3 className="mt-0.5 text-lg font-bold text-brand-brown">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-brand-brown/60">
          {product.blurb}
        </p>

        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            <span className="text-xs text-brand-brown/50">{product.minNote ?? "from"}</span>
            <p className="text-xl font-bold text-brand-orange">
              ₦{product.price.toLocaleString()}
              <span className="text-sm font-medium text-brand-brown/50">/{product.unit}</span>
            </p>
          </div>
          <a
            href={whatsappHref(`Hello Protein Pack! I'd like to order ${product.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-brown"
          >
            <FaWhatsapp size={15} />
            Order
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export default function ProductPage() {
  const [selectedType, setSelectedType] = useState("All");
  const [selectedForm, setSelectedForm] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = popularProducts.filter((product) => {
    const matchesType = selectedType === "All" || product.type === selectedType;
    const matchesForm = selectedForm === "All" || product.form === selectedForm;
    const matchesSearch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.blurb.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesForm && matchesSearch;
  });

  const hasFilters = selectedType !== "All" || selectedForm !== "All" || searchTerm !== "";

  const clearFilters = () => {
    setSelectedType("All");
    setSelectedForm("All");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section
        className="relative flex min-h-[70vh] w-full items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/2.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-brand-brown/60 via-brand-brown/35 to-brand-brown/70" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-[12vh] text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-peach">
            Our Shop
          </span>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-brand-cream md:text-6xl lg:text-7xl">
            Farm-fresh protein, ready to order
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-brand-cream/70 sm:text-lg">
            Chicken, fish and eggs, raised and processed on our Lagos farm and delivered
            straight to your door.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="px-4 py-12 text-center sm:px-10 md:px-16">
        <p className="mx-auto max-w-2xl text-lg text-brand-brown/70">
          Protein Pack supplies fresh chicken, fish and eggs to homes, restaurants and businesses
          across Lagos. Everything is raised and processed on our farm, with honest pricing and
          strict hygiene, then delivered straight to your door.
        </p>
      </section>

      {/* Catalog */}
      <section className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Filters */}
          <aside className="h-fit w-full space-y-8 rounded-2xl border border-brand-tan/50 bg-white px-6 py-8 lg:sticky lg:top-28 lg:w-1/4">
            <h3 className="border-b border-brand-tan/50 pb-3 text-xl font-bold text-brand-brown">
              Filter products
            </h3>

            <div className="space-y-1.5">
              <label htmlFor="search" className="text-sm font-medium text-brand-brown/70">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-brown/40" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-brand-tan/70 py-2 pl-10 pr-4 text-brand-brown outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-brand-brown">Type</h4>
              {PRODUCT_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2 text-sm text-brand-brown/70">
                  <input
                    type="radio"
                    name="type"
                    checked={selectedType === type}
                    onChange={() => setSelectedType(type)}
                    className="accent-brand-orange"
                  />
                  {type}
                </label>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-brand-brown">Form</h4>
              {FORMS.map((form) => (
                <label key={form} className="flex items-center gap-2 text-sm text-brand-brown/70">
                  <input
                    type="radio"
                    name="form"
                    checked={selectedForm === form}
                    onChange={() => setSelectedForm(form)}
                    className="accent-brand-orange"
                  />
                  {form}
                </label>
              ))}
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-semibold text-brand-orange hover:underline"
              >
                Clear all filters
              </button>
            )}
          </aside>

          {/* Grid */}
          <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center text-brand-brown/60">
                <p className="text-2xl font-bold text-brand-brown">No products found</p>
                <p className="mt-1 text-sm">Try adjusting your filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-5 rounded-full bg-brand-orange px-6 py-2.5 font-semibold text-white transition-colors hover:bg-brand-brown"
                >
                  Clear filters
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
