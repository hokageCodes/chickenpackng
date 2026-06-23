"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wallet, Landmark, ArrowRight, AlertCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import { useCart } from "@/contexts/CartContext";
import { zones, getZone } from "@/data/delivery";
import { whatsappHref } from "@/lib/site";
import { createOrder } from "./actions";

const PAYMENT_OPTIONS = [
  { id: "cash", label: "Cash on delivery", desc: "Pay when your order arrives.", icon: Wallet },
  { id: "transfer", label: "Bank transfer", desc: "We'll show account details next.", icon: Landmark },
  { id: "whatsapp", label: "WhatsApp", desc: "Arrange order and payment with us.", icon: FaWhatsapp },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    zoneId: "",
    paymentMethod: "cash",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const zone = getZone(form.zoneId);
  const deliveryFee = zone?.fee ?? 0;
  const total = subtotal + deliveryFee;
  const belowMin = zone && subtotal < zone.minOrder;

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const buildWhatsAppMessage = (number, orderTotal) => {
    const lines = [
      `Hello Protein Pack! New order #${number}.`,
      "",
      ...items.map((i) => `- ${i.name} x${i.qty} = NGN ${(i.price * i.qty).toLocaleString()}`),
      "",
      `Subtotal: NGN ${subtotal.toLocaleString()}`,
      `Delivery (${zone?.name ?? ""}): ${zone?.fee === null ? "on request" : `NGN ${deliveryFee.toLocaleString()}`}`,
      `Total: NGN ${orderTotal.toLocaleString()}`,
      "",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Address: ${form.address}`,
    ];
    return lines.join("\n");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (belowMin) {
      setError(`Minimum order for ${zone.name} is ₦${zone.minOrder.toLocaleString()}.`);
      return;
    }

    setSubmitting(true);
    const res = await createOrder({
      ...form,
      items: items.map((i) => ({ id: i.id, qty: i.qty })),
    });
    setSubmitting(false);

    if ("error" in res) {
      setError(res.error);
      return;
    }

    if (form.paymentMethod === "whatsapp") {
      window.open(
        whatsappHref(buildWhatsAppMessage(res.number, res.total)),
        "_blank",
        "noopener,noreferrer"
      );
    }
    clearCart();
    router.push(`/checkout/success?order=${res.number}&method=${form.paymentMethod}`);
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-cream px-4 text-center">
        <p className="text-lg font-bold text-brand-brown">Your cart is empty</p>
        <p className="mt-1 text-sm text-brand-brown/60">Add items before checking out.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-orange px-7 py-3 font-semibold text-white transition-colors hover:bg-brand-brown"
        >
          Browse the shop
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-brand-tan/70 px-4 py-2.5 text-brand-brown outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange";

  return (
    <div className="min-h-screen bg-brand-cream px-4 pb-20 pt-[16vh] sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[1100px]">
        <h1 className="text-3xl font-bold text-brand-brown sm:text-4xl">Checkout</h1>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Details */}
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-brand-tan/50 bg-white p-6">
              <h2 className="text-lg font-bold text-brand-brown">Delivery details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brand-brown">Full name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className={inputClass}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brand-brown">Phone</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={inputClass}
                    placeholder="080..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-brand-brown">
                    Email <span className="text-brand-brown/40">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={inputClass}
                    placeholder="you@email.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-brand-brown">
                    Delivery address
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    className={`${inputClass} resize-none`}
                    placeholder="Street, area, landmark"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-brand-brown">
                    Delivery area
                  </label>
                  <select
                    required
                    value={form.zoneId}
                    onChange={(e) => set("zoneId", e.target.value)}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Choose your area
                    </option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} ({z.fee === null ? "fee on request" : `₦${z.fee.toLocaleString()}`})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-brand-brown">
                    Order note <span className="text-brand-brown/40">(optional)</span>
                  </label>
                  <input
                    value={form.note}
                    onChange={(e) => set("note", e.target.value)}
                    className={inputClass}
                    placeholder="Anything we should know?"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-brand-tan/50 bg-white p-6">
              <h2 className="text-lg font-bold text-brand-brown">Payment</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {PAYMENT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = form.paymentMethod === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => set("paymentMethod", opt.id)}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        active
                          ? "border-brand-orange bg-brand-orange/5"
                          : "border-brand-tan/60 hover:border-brand-orange"
                      }`}
                    >
                      <Icon size={20} className="text-brand-orange" />
                      <p className="mt-2 font-semibold text-brand-brown">{opt.label}</p>
                      <p className="mt-0.5 text-xs text-brand-brown/60">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-2xl border border-brand-tan/50 bg-white p-6 lg:sticky lg:top-28">
            <h2 className="text-lg font-bold text-brand-brown">Your order</h2>
            <div className="mt-4 space-y-2 border-b border-brand-tan/40 pb-4 text-sm">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between gap-3">
                  <span className="text-brand-brown/70">
                    {i.name} <span className="text-brand-brown/40">× {i.qty}</span>
                  </span>
                  <span className="font-medium text-brand-brown">
                    ₦{(i.price * i.qty).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-brand-brown/60">Subtotal</dt>
                <dd className="font-medium text-brand-brown">₦{subtotal.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-brown/60">Delivery</dt>
                <dd className="font-medium text-brand-brown">
                  {!zone
                    ? "Select area"
                    : zone.fee === null
                    ? "On request"
                    : `₦${deliveryFee.toLocaleString()}`}
                </dd>
              </div>
              <div className="flex justify-between border-t border-brand-tan/40 pt-3 text-base">
                <dt className="font-bold text-brand-brown">Total</dt>
                <dd className="font-bold text-brand-orange">₦{total.toLocaleString()}</dd>
              </div>
            </dl>

            {belowMin && (
              <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                Minimum order for {zone.name} is ₦{zone.minOrder.toLocaleString()}.
              </p>
            )}

            {error && (
              <p className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || belowMin}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange py-3.5 font-semibold text-white transition-colors hover:bg-brand-brown disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Placing order..." : "Place order"}
              {!submitting && <ArrowRight size={18} />}
            </button>
            <p className="mt-3 text-center text-xs text-brand-brown/50">
              We'll confirm your order and delivery window with you.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}
