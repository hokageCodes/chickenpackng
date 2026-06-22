"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export type ProductState = { error?: string; success?: string };

function done() {
  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = base || "product";
  let n = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

async function saveImage(file: File): Promise<string> {
  const ext = ((file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "")) || "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;

  // Production: Vercel Blob (set BLOB_READ_WRITE_TOKEN).
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${filename}`, file, { access: "public" });
    return blob.url;
  }

  // Dev fallback: write to public/uploads (served at /uploads/...). Not for serverless prod.
  const { writeFile, mkdir } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${filename}`;
}

async function resolveImage(formData: FormData, fallbackPath: string): Promise<string> {
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) return saveImage(file);
  return fallbackPath;
}

async function categoryIdFor(name: string) {
  if (!name) return null;
  const slug = slugify(name);
  const cat = await prisma.category.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  });
  return cat.id;
}

function parseForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    imagePath: String(formData.get("image") ?? "").trim(),
    published: formData.get("published") === "on",
    unit: String(formData.get("unit") ?? "kg").trim() || "kg",
    price: Math.max(0, Number(formData.get("price")) || 0),
    minQty: Math.max(0, Number(formData.get("minQty")) || 0) || 1,
    step: Math.max(0, Number(formData.get("step")) || 0) || 1,
  };
}

export async function createProduct(
  _prev: ProductState,
  formData: FormData
): Promise<ProductState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const f = parseForm(formData);
  if (!f.name) return { error: "Name is required." };

  const slug = await uniqueSlug(slugify(f.name));
  const categoryId = await categoryIdFor(f.category);
  let image: string;
  try {
    image = await resolveImage(formData, f.imagePath);
  } catch {
    return { error: "Image upload failed. Try a smaller file." };
  }

  try {
    await prisma.product.create({
      data: {
        name: f.name,
        slug,
        categoryId,
        description: f.description || null,
        image: image || null,
        published: f.published,
        unit: f.unit,
        pricePerUnitNGN: f.price,
        minQty: f.minQty,
        step: f.step,
      },
    });
  } catch {
    return { error: "Could not create. Please try again." };
  }
  done();
  return { success: `${f.name} created.` };
}

export async function updateProduct(
  _prev: ProductState,
  formData: FormData
): Promise<ProductState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const id = String(formData.get("id") ?? "");
  const f = parseForm(formData);
  if (!f.name) return { error: "Name is required." };

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { error: "Product not found." };

  const slug = await uniqueSlug(slugify(f.name), id);
  const categoryId = await categoryIdFor(f.category);
  let image: string;
  try {
    image = await resolveImage(formData, f.imagePath);
  } catch {
    return { error: "Image upload failed. Try a smaller file." };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: f.name,
        slug,
        categoryId,
        description: f.description || null,
        image: image || null,
        published: f.published,
        unit: f.unit,
        pricePerUnitNGN: f.price,
        minQty: f.minQty,
        step: f.step,
      },
    });
  } catch {
    return { error: "Could not update. Please try again." };
  }
  done();
  return { success: "Product updated." };
}

export async function deleteProduct(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." };
  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Could not delete." };
  }
  done();
  return { ok: true };
}
