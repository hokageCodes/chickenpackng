"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export type ZoneState = { error?: string; success?: string };

function done() {
  revalidatePath("/admin/delivery");
  revalidatePath("/admin");
}

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  areas: z.string().trim().optional(),
  fee: z.coerce.number().nonnegative("Fee can't be negative"),
  minOrder: z.coerce.number().nonnegative("Minimum can't be negative"),
  eta: z.string().trim().optional(),
  active: z.boolean(),
});

function parse(formData: FormData) {
  return schema.safeParse({
    name: formData.get("name"),
    areas: formData.get("areas"),
    fee: formData.get("fee"),
    minOrder: formData.get("minOrder"),
    eta: formData.get("eta"),
    active: formData.get("active") === "on",
  });
}

export async function createZone(_prev: ZoneState, formData: FormData): Promise<ZoneState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { name, areas, fee, minOrder, eta, active } = parsed.data;

  try {
    await prisma.deliveryZone.create({
      data: { name, areas: areas || null, feeNGN: fee, minOrderNGN: minOrder, eta: eta || null, active },
    });
  } catch {
    return { error: "Could not create — a zone with that name may already exist." };
  }
  done();
  return { success: `${name} added.` };
}

export async function updateZone(_prev: ZoneState, formData: FormData): Promise<ZoneState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };
  const id = String(formData.get("id") ?? "");
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { name, areas, fee, minOrder, eta, active } = parsed.data;

  try {
    await prisma.deliveryZone.update({
      where: { id },
      data: { name, areas: areas || null, feeNGN: fee, minOrderNGN: minOrder, eta: eta || null, active },
    });
  } catch {
    return { error: "Could not update — a zone with that name may already exist." };
  }
  done();
  return { success: "Zone updated." };
}

export async function toggleZone(id: string, active: boolean) {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.deliveryZone.update({ where: { id }, data: { active } }).catch(() => {});
  done();
}

export async function deleteZone(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." };
  try {
    await prisma.deliveryZone.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Could not delete." };
  }
  done();
  return { ok: true };
}
