"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const STATUSES = [
  "PENDING",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;
type OrderStatus = (typeof STATUSES)[number];

function done() {
  revalidatePath("/shop/orders");
  revalidatePath("/shop");
}

export async function updateOrderStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  if (!STATUSES.includes(status as OrderStatus)) return;
  await prisma.order
    .update({ where: { id }, data: { status: status as OrderStatus } })
    .catch(() => {});
  done();
}

export async function deleteOrder(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  // OrderItems cascade via the schema relation.
  await prisma.order.delete({ where: { id } }).catch(() => {});
  done();
}
