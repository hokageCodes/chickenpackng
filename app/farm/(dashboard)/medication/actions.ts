"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export type MedicationState = { error?: string; success?: string };

const medSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  quantity: z.coerce.number().nonnegative("Quantity can't be negative"),
  unit: z.string().trim().optional(),
  purchaseDate: z.string().optional(),
  expiryDate: z.string().optional(),
  remaining: z.coerce.number().nonnegative("Remaining can't be negative").optional(),
});

const eventSchema = z.object({
  type: z.enum(["VACCINATION", "MEDICATION", "VET_VISIT", "OUTBREAK"]),
  date: z.string().min(1, "Date is required"),
  target: z.string().optional(), // group:ID or pond:ID
  medicationId: z.string().optional(),
  dosage: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

function done() {
  revalidatePath("/farm/medication");
  revalidatePath("/farm");
}

export async function createMedication(_prev: MedicationState, formData: FormData): Promise<MedicationState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = medSchema.safeParse({
    name: formData.get("name"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    purchaseDate: formData.get("purchaseDate"),
    expiryDate: formData.get("expiryDate"),
    remaining: formData.get("remaining"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { name, quantity, unit, purchaseDate, expiryDate, remaining } = parsed.data;

  try {
    await prisma.medication.create({
      data: {
        name,
        quantity,
        unit: unit || "unit",
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        remaining: typeof remaining === "number" ? remaining : quantity,
        createdById: session.user.id,
      },
    });
  } catch {
    return { error: "Could not save medication. Please try again." };
  }

  done();
  return { success: `${name} added.` };
}

export async function updateMedication(_prev: MedicationState, formData: FormData): Promise<MedicationState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const id = String(formData.get("id") ?? "");
  const parsed = medSchema.safeParse({
    name: formData.get("name"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    purchaseDate: formData.get("purchaseDate"),
    expiryDate: formData.get("expiryDate"),
    remaining: formData.get("remaining"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { name, quantity, unit, purchaseDate, expiryDate, remaining } = parsed.data;

  try {
    await prisma.medication.update({
      where: { id },
      data: {
        name,
        quantity,
        unit: unit || "unit",
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        remaining: typeof remaining === "number" ? remaining : quantity,
      },
    });
  } catch {
    return { error: "Could not update. Please try again." };
  }

  done();
  return { success: "Updated." };
}

export async function deleteMedication(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." };

  const linked = await prisma.healthEvent.count({ where: { medicationId: id } });
  if (linked > 0) return { ok: false, error: "Medication has linked health events. Delete those first." };

  try {
    await prisma.medication.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Could not delete." };
  }
  done();
  return { ok: true };
}

/* ---------- health events ---------- */
export async function createHealthEvent(_prev: MedicationState, formData: FormData): Promise<MedicationState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = eventSchema.safeParse({
    type: formData.get("type"),
    date: formData.get("date"),
    target: formData.get("target"),
    medicationId: formData.get("medicationId"),
    dosage: formData.get("dosage"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { type, date, target, medicationId, dosage, notes } = parsed.data;

  let groupId: string | null = null;
  let pondId: string | null = null;
  if (target && target.includes(":")) {
    const [kind, id] = target.split(":");
    if (kind === "group") groupId = id;
    else if (kind === "pond") pondId = id;
  }

  try {
    await prisma.healthEvent.create({
      data: {
        type,
        date: new Date(date),
        groupId,
        pondId,
        medicationId: medicationId || null,
        dosage: dosage || null,
        notes: notes || null,
        createdById: session.user.id,
      },
    });
  } catch (e) {
    return { error: "Could not save health event. Please try again." };
  }

  done();
  return { success: "Event logged." };
}

export async function updateHealthEvent(_prev: MedicationState, formData: FormData): Promise<MedicationState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const id = String(formData.get("id") ?? "");
  const parsed = eventSchema.safeParse({
    type: formData.get("type"),
    date: formData.get("date"),
    target: formData.get("target"),
    medicationId: formData.get("medicationId"),
    dosage: formData.get("dosage"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { type, date, target, medicationId, dosage, notes } = parsed.data;

  let groupId: string | null = null;
  let pondId: string | null = null;
  if (target && target.includes(":")) {
    const [kind, gid] = target.split(":");
    if (kind === "group") groupId = gid;
    else if (kind === "pond") pondId = gid;
  }

  try {
    await prisma.healthEvent.update({
      where: { id },
      data: {
        type,
        date: new Date(date),
        groupId,
        pondId,
        medicationId: medicationId || null,
        dosage: dosage || null,
        notes: notes || null,
      },
    });
  } catch {
    return { error: "Could not update. Please try again." };
  }

  done();
  return { success: "Updated." };
}

export async function deleteHealthEvent(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.healthEvent.delete({ where: { id } }).catch(() => {});
  done();
}
