"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem } = useCart();

  return (
    <div className="min-h-screen bg-brand-cream px-4 pb-20 pt-[16vh] sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[1100px]">
        <h1 className="text-3xl font-bold text-brand-brown sm:text-4xl">Your cart</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-brand-tan/50 bg-white py-20 text-center">
            <ShoppingBag size={44} className="mx-auto text-brand-tan" />
            <p className="mt-4 text-lg font-bold text-brand-brown">Your cart is empty</p>
            <p className="mt-1 text-sm text-brand-brown/60">
              Add some farm-fresh protein to get started.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-orange px-7 py-3 font-semibold text-white transition-colors hover:bg-brand-brown"
            >
              Browse the shop
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Items */}
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-brand-tan/50 bg-white p-4"
                >
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-brand-cream">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-brand-tan">
                        <ShoppingBag size={26} />
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-brand-brown">{item.name}</p>
                        <p className="text-sm text-brand-brown/60">
                          ₦{item.price.toLocaleString()}/{item.unit}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove"
                        className="text-brand-brown/40 transition-colors hover:text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full border border-brand-tan/70">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          aria-label="Decrease quantity"
                          className="px-3 py-1.5 text-brand-brown transition-colors hover:text-brand-orange"
                        >
                          <Minus size={15} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-brand-brown">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          aria-label="Increase quantity"
                          className="px-3 py-1.5 text-brand-brown transition-colors hover:text-brand-orange"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                      <p className="font-bold text-brand-orange">
                        ₦{(item.price * item.qty).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <aside className="h-fit rounded-2xl border border-brand-tan/50 bg-white p-6 lg:sticky lg:top-28">
              <h2 className="text-lg font-bold text-brand-brown">Order summary</h2>
              <div className="mt-4 flex items-center justify-between border-b border-brand-tan/40 pb-4 text-sm">
                <span className="text-brand-brown/60">Subtotal</span>
                <span className="font-bold text-brand-brown">₦{subtotal.toLocaleString()}</span>
              </div>
              <p className="mt-3 text-xs text-brand-brown/50">
                Delivery is calculated at checkout based on your area.
              </p>

              <Link
                href="/checkout"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange py-3.5 font-semibold text-white transition-colors hover:bg-brand-brown"
              >
                Proceed to checkout
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/products"
                className="mt-3 block text-center text-sm font-medium text-brand-brown/70 transition-colors hover:text-brand-orange"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
