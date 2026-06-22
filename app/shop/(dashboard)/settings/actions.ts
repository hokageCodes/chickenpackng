"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export type SettingsState = { error?: string; success?: string };

const schema = z.object({
  storeName: z.string().trim().min(1, "Store name is required"),
  supportEmail: z.string().trim().optional(),
  supportPhone: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  address: z.string().trim().optional(),
  currency: z.string().trim().min(1).default("NGN"),
});

export async function updateSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = schema.safeParse({
    storeName: formData.get("storeName"),
    supportEmail: formData.get("supportEmail"),
    supportPhone: formData.get("supportPhone"),
    whatsapp: formData.get("whatsapp"),
    address: formData.get("address"),
    currency: formData.get("currency"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { storeName, supportEmail, supportPhone, whatsapp, address, currency } = parsed.data;
  const data = {
    storeName,
    supportEmail: supportEmail || null,
    supportPhone: supportPhone || null,
    whatsapp: whatsapp || null,
    address: address || null,
    currency,
  };

  try {
    await prisma.storeSetting.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
  } catch {
    return { error: "Could not save. Please try again." };
  }

  revalidatePath("/shop/settings");
  revalidatePath("/shop");
  return { success: "Settings saved." };
}
