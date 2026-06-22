"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export type CustomerState = { error?: string; success?: string };

function done() {
  revalidatePath("/admin/customers");
  revalidatePath("/admin");
}

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.enum(["RETAIL", "DISTRIBUTOR", "AGENT"]),
  phone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

function parse(formData: FormData) {
  return schema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
  });
}

export async function createCustomer(
  _prev: CustomerState,
  formData: FormData
): Promise<CustomerState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { name, type, phone, email, address } = parsed.data;

  try {
    await prisma.customer.create({
      data: {
        name,
        type,
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    });
  } catch {
    return { error: "Could not create. Please try again." };
  }
  done();
  return { success: `${name} added.` };
}

export async function updateCustomer(
  _prev: CustomerState,
  formData: FormData
): Promise<CustomerState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const id = String(formData.get("id") ?? "");
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { name, type, phone, email, address } = parsed.data;

  try {
    await prisma.customer.update({
      where: { id },
      data: {
        name,
        type,
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    });
  } catch {
    return { error: "Could not update. Please try again." };
  }
  done();
  return { success: "Customer updated." };
}

export async function approveRequest(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." };
  const c = await prisma.customer.findUnique({ where: { id } });
  if (!c?.requestedType) return { ok: false, error: "No pending request." };
  await prisma.customer.update({
    where: { id },
    data: { type: c.requestedType, requestedType: null },
  });
  done();
  return { ok: true };
}

export async function declineRequest(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.customer.update({ where: { id }, data: { requestedType: null } }).catch(() => {});
  done();
}

export async function deleteCustomer(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." };

  const orders = await prisma.order.count({ where: { customerId: id } });
  if (orders > 0) {
    return { ok: false, error: "This customer has orders and can't be deleted." };
  }

  try {
    await prisma.customer.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Could not delete." };
  }
  done();
  return { ok: true };
}
