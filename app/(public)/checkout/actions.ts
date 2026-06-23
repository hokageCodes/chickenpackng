"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { popularProducts } from "@/data/popular";
import { getZone } from "@/data/delivery";

const PAYMENT_LABEL: Record<string, string> = {
  cash: "Cash on delivery",
  transfer: "Bank transfer",
  whatsapp: "WhatsApp",
};

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  email: z.string().trim().email().optional().or(z.literal("")),
  address: z.string().trim().min(5, "Enter your delivery address"),
  zoneId: z.string().min(1, "Choose a delivery area"),
  paymentMethod: z.enum(["cash", "transfer", "whatsapp"]),
  note: z.string().trim().optional(),
  items: z
    .array(z.object({ id: z.string(), qty: z.coerce.number().positive() }))
    .min(1, "Your cart is empty"),
});

export type CheckoutResult =
  | { error: string }
  | { ok: true; number: number; total: number };

export async function createOrder(input: unknown): Promise<CheckoutResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const { name, phone, email, address, zoneId, paymentMethod, note, items } = parsed.data;

  const zone = getZone(zoneId);
  if (!zone) return { error: "Choose a valid delivery area." };

  // Build line items from the catalog (authoritative prices, ignore client prices).
  const lineItems = items
    .map((it) => {
      const p = popularProducts.find((pp) => pp.id === it.id);
      if (!p) return null;
      const unitPrice = p.price;
      return {
        name: `${p.name} (per ${p.unit})`,
        qty: it.qty,
        unitPriceNGN: unitPrice,
        lineTotalNGN: unitPrice * it.qty,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (lineItems.length === 0) return { error: "Your cart is empty." };

  const subtotal = lineItems.reduce((s, l) => s + l.lineTotalNGN, 0);
  if (subtotal < zone.minOrder) {
    return {
      error: `Minimum order for ${zone.name} is ₦${zone.minOrder.toLocaleString()}.`,
    };
  }

  const deliveryFee = zone.fee ?? 0;
  const total = subtotal + deliveryFee;

  const noteParts = [
    `Payment: ${PAYMENT_LABEL[paymentMethod]}`,
    `Zone: ${zone.name}`,
    zone.fee === null ? "Delivery fee confirmed after order" : null,
    note ? `Note: ${note}` : null,
  ].filter(Boolean);

  try {
    // Warm the serverless DB so the transaction doesn't time out on a cold start.
    await prisma.$queryRaw`SELECT 1`;
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.customer.findFirst({ where: { phone } });
      const customer = existing
        ? await tx.customer.update({
            where: { id: existing.id },
            data: { name, email: email || null, address },
          })
        : await tx.customer.create({
            data: { name, phone, email: email || null, address, type: "RETAIL" },
          });

      return tx.order.create({
        data: {
          customerId: customer.id,
          status: "PENDING",
          subtotalNGN: subtotal,
          deliveryFeeNGN: deliveryFee,
          totalNGN: total,
          note: noteParts.join(" | "),
          items: { create: lineItems },
          payments: {
            create: {
              reference: `PP-${randomUUID().slice(0, 8).toUpperCase()}`,
              provider: paymentMethod,
              channel: paymentMethod,
              amountNGN: total,
              status: "PENDING",
              customerName: name,
              email: email || null,
            },
          },
        },
      });
    }, { maxWait: 15000, timeout: 20000 });

    revalidatePath("/shop/orders");
    revalidatePath("/shop/payments");
    revalidatePath("/shop/customers");

    return { ok: true, number: order.number, total };
  } catch {
    return { error: "Could not place your order. Please try again." };
  }
}
