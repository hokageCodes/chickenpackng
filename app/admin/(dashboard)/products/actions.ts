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

async function categoryIdFor(name: string) {
  if (!name) return null;
  const slug = slugify(name);
  const cat = await prisma.category.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  });
  return cat.id;
}

type VariantInput = { label: string; price: number };

function parseForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  const published = formData.get("published") === "on";

  let variants: VariantInput[] = [];
  try {
    const raw = JSON.parse(String(formData.get("variants") ?? "[]"));
    if (Array.isArray(raw)) {
      variants = raw
        .filter((v) => v && String(v.label).trim())
        .map((v) => ({ label: String(v.label).trim(), price: Math.max(0, Number(v.price) || 0) }));
    }
  } catch {
    /* ignore */
  }
  return { name, category, description, image, published, variants };
}

export async function createProduct(
  _prev: ProductState,
  formData: FormData
): Promise<ProductState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const { name, category, description, image, published, variants } = parseForm(formData);
  if (!name) return { error: "Name is required." };
  if (variants.length === 0) return { error: "Add at least one variant (size + price)." };

  const slug = await uniqueSlug(slugify(name));
  const categoryId = await categoryIdFor(category);

  try {
    await prisma.product.create({
      data: {
        name,
        slug,
        categoryId,
        description: description || null,
        image: image || null,
        published,
        variants: {
          create: variants.map((v) => ({
            label: v.label,
            priceNGN: v.price,
            sku: `${slug}-${slugify(v.label)}`,
          })),
        },
      },
    });
  } catch {
    return { error: "Could not create. Please try again." };
  }
  done();
  return { success: `${name} created.` };
}

export async function updateProduct(
  _prev: ProductState,
  formData: FormData
): Promise<ProductState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const id = String(formData.get("id") ?? "");
  const { name, category, description, image, published, variants } = parseForm(formData);
  if (!name) return { error: "Name is required." };
  if (variants.length === 0) return { error: "Add at least one variant (size + price)." };

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { error: "Product not found." };

  const slug = await uniqueSlug(slugify(name), id);
  const categoryId = await categoryIdFor(category);

  try {
    await prisma.$transaction([
      prisma.productVariant.deleteMany({ where: { productId: id } }),
      prisma.product.update({
        where: { id },
        data: {
          name,
          slug,
          categoryId,
          description: description || null,
          image: image || null,
          published,
          variants: {
            create: variants.map((v) => ({
              label: v.label,
              priceNGN: v.price,
              sku: `${slug}-${slugify(v.label)}-${Math.random().toString(36).slice(2, 6)}`,
            })),
          },
        },
      }),
    ]);
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
    await prisma.product.delete({ where: { id } }); // variants cascade
  } catch {
    return { ok: false, error: "Could not delete." };
  }
  done();
  return { ok: true };
}
