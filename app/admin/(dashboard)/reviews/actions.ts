"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export type ReviewState = { error?: string; success?: string };

function done() {
  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
}

const schema = z.object({
  productId: z.string().optional(),
  customerName: z.string().trim().min(1, "Name is required"),
  rating: z.coerce.number().int().min(1, "Rating 1–5").max(5, "Rating 1–5"),
  body: z.string().trim().optional(),
  approved: z.boolean(),
});

function parse(formData: FormData) {
  return schema.safeParse({
    productId: formData.get("productId"),
    customerName: formData.get("customerName"),
    rating: formData.get("rating"),
    body: formData.get("body"),
    approved: formData.get("approved") === "on",
  });
}

export async function createReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { productId, customerName, rating, body, approved } = parsed.data;

  try {
    await prisma.review.create({
      data: { productId: productId || null, customerName, rating, body: body || null, approved },
    });
  } catch {
    return { error: "Could not save. Please try again." };
  }
  done();
  return { success: "Review added." };
}

export async function updateReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };
  const id = String(formData.get("id") ?? "");
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { productId, customerName, rating, body, approved } = parsed.data;

  try {
    await prisma.review.update({
      where: { id },
      data: { productId: productId || null, customerName, rating, body: body || null, approved },
    });
  } catch {
    return { error: "Could not update. Please try again." };
  }
  done();
  return { success: "Review updated." };
}

export async function approveReview(id: string, approved: boolean) {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.review.update({ where: { id }, data: { approved } }).catch(() => {});
  done();
}

export async function deleteReview(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." };
  try {
    await prisma.review.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Could not delete." };
  }
  done();
  return { ok: true };
}
