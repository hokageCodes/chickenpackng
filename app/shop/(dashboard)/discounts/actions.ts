"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export type DiscountState = { error?: string; success?: string };

function done() {
  revalidatePath("/shop/discounts");
  revalidatePath("/shop");
}

const schema = z.object({
  code: z.string().trim().min(1, "Code is required"),
  description: z.string().trim().optional(),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.coerce.number().positive("Value must be greater than 0"),
  minOrder: z.coerce.number().nonnegative("Minimum can't be negative"),
  active: z.boolean(),
});

function parseExtras(formData: FormData) {
  const muRaw = String(formData.get("maxUses") ?? "").trim();
  const maxUses = muRaw && Number(muRaw) > 0 ? Math.floor(Number(muRaw)) : null;
  const startsRaw = String(formData.get("startsAt") ?? "").trim();
  const expiresRaw = String(formData.get("expiresAt") ?? "").trim();
  return {
    maxUses,
    startsAt: startsRaw ? new Date(startsRaw) : null,
    expiresAt: expiresRaw ? new Date(expiresRaw) : null,
  };
}

function validate(formData: FormData) {
  const parsed = schema.safeParse({
    code: formData.get("code"),
    description: formData.get("description"),
    type: formData.get("type"),
    value: formData.get("value"),
    minOrder: formData.get("minOrder"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const data = parsed.data;
  if (data.type === "PERCENT" && data.value > 100) {
    return { error: "A percentage discount can't exceed 100%." };
  }
  return { data: { ...data, code: data.code.toUpperCase().replace(/\s+/g, ""), ...parseExtras(formData) } };
}

export async function createDiscount(_prev: DiscountState, formData: FormData): Promise<DiscountState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };
  const v = validate(formData);
  if (v.error) return { error: v.error };
  const { code, description, type, value, minOrder, active, maxUses, startsAt, expiresAt } = v.data!;

  try {
    await prisma.discount.create({
      data: { code, description: description || null, type, value, minOrderNGN: minOrder, maxUses, startsAt, expiresAt, active },
    });
  } catch {
    return { error: "Could not create — that code may already exist." };
  }
  done();
  return { success: `${code} created.` };
}

export async function updateDiscount(_prev: DiscountState, formData: FormData): Promise<DiscountState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };
  const id = String(formData.get("id") ?? "");
  const v = validate(formData);
  if (v.error) return { error: v.error };
  const { code, description, type, value, minOrder, active, maxUses, startsAt, expiresAt } = v.data!;

  try {
    await prisma.discount.update({
      where: { id },
      data: { code, description: description || null, type, value, minOrderNGN: minOrder, maxUses, startsAt, expiresAt, active },
    });
  } catch {
    return { error: "Could not update — that code may already exist." };
  }
  done();
  return { success: "Discount updated." };
}

export async function toggleDiscount(id: string, active: boolean) {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.discount.update({ where: { id }, data: { active } }).catch(() => {});
  done();
}

export async function deleteDiscount(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." };
  try {
    await prisma.discount.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Could not delete." };
  }
  done();
  return { ok: true };
}
