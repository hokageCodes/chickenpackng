"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Landmark, Wallet } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import { BANK } from "@/lib/site";

function SuccessInner() {
  const params = useSearchParams();
  const number = params.get("order");
  const method = params.get("method") ?? "cash";

  return (
    <div className="min-h-screen bg-brand-cream px-4 pb-20 pt-[16vh]">
      <div className="mx-auto max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
          <CheckCircle2 size={34} />
        </span>
        <h1 className="mt-5 text-3xl font-bold text-brand-brown sm:text-4xl">Order placed!</h1>
        <p className="mt-2 text-brand-brown/60">
          Thank you. {number ? <>Your order <strong className="text-brand-brown">#{number}</strong> is in.</> : "Your order is in."} We'll confirm
          your delivery window with you shortly.
        </p>

        {/* Method-specific instructions */}
        <div className="mt-8 rounded-2xl border border-brand-tan/50 bg-white p-6 text-left">
          {method === "transfer" && (
            <>
              <div className="flex items-center gap-2 text-brand-brown">
                <Landmark size={18} className="text-brand-orange" />
                <h2 className="font-bold">Pay by bank transfer</h2>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-brand-brown/60">Bank</dt>
                  <dd className="font-semibold text-brand-brown">{BANK.bankName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-brand-brown/60">Account name</dt>
                  <dd className="font-semibold text-brand-brown">{BANK.accountName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-brand-brown/60">Account number</dt>
                  <dd className="font-semibold text-brand-brown">{BANK.accountNumber}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-brand-brown/60">
                Use <strong className="text-brand-brown">#{number}</strong> as your transfer
                reference, then send us your receipt on WhatsApp.
              </p>
            </>
          )}

          {method === "cash" && (
            <>
              <div className="flex items-center gap-2 text-brand-brown">
                <Wallet size={18} className="text-brand-orange" />
                <h2 className="font-bold">Cash on delivery</h2>
              </div>
              <p className="mt-3 text-sm text-brand-brown/60">
                Please have your cash ready when your order arrives. Our rider will reach out before
                delivery.
              </p>
            </>
          )}

          {method === "whatsapp" && (
            <>
              <div className="flex items-center gap-2 text-brand-brown">
                <FaWhatsapp size={18} className="text-brand-orange" />
                <h2 className="font-bold">Finish on WhatsApp</h2>
              </div>
              <p className="mt-3 text-sm text-brand-brown/60">
                We've opened WhatsApp with your order details. Send the message and we'll confirm
                payment and delivery with you.
              </p>
            </>
          )}
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="rounded-full bg-brand-orange px-7 py-3 font-semibold text-white transition-colors hover:bg-brand-brown"
          >
            Continue shopping
          </Link>
          <Link
            href="/"
            className="rounded-full border border-brand-brown/20 px-7 py-3 font-semibold text-brand-brown transition-colors hover:border-brand-orange hover:text-brand-orange"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}
