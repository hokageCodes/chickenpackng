"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2, Package, ImageIcon } from "lucide-react";
import { createProduct, updateProduct, deleteProduct, type ProductState } from "./actions";

export type Variant = { label: string; price: number };
export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  published: boolean;
  variants: Variant[];
};

const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
const priceRange = (vs: Variant[]) => {
  if (vs.length === 0) return "—";
  const prices = vs.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? naira(min) : `${naira(min)} – ${naira(max)}`;
};

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";
const submitClass =
  "w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60";

function Thumb({ src, name }: { src: string; name: string }) {
  if (!src) {
    return (
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <ImageIcon size={16} />
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />;
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-muted-foreground hover:bg-accent">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ProductForm({ initial, onDone }: { initial?: Product; onDone: () => void }) {
  const router = useRouter();
  const isEdit = !!initial;
  const [state, action, pending] = useActionState<ProductState, FormData>(
    isEdit ? updateProduct : createProduct,
    {}
  );
  const [variants, setVariants] = useState<Variant[]>(
    initial?.variants?.length ? initial.variants : [{ label: "", price: 0 }]
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onDone();
    }
  }, [state.success, onDone, router]);

  const setRow = (i: number, field: keyof Variant, val: string) =>
    setVariants((v) => v.map((r, idx) => (idx === i ? { ...r, [field]: field === "price" ? Number(val) || 0 : val } : r)));

  return (
    <form action={action} className="space-y-3">
      {isEdit && <input type="hidden" name="id" value={initial!.id} />}
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={labelClass}>Product name</span>
          <input name="name" required defaultValue={initial?.name} placeholder="Full Chicken" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Category</span>
          <input name="category" defaultValue={initial?.category} placeholder="Chicken" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Image path / URL</span>
          <input name="image" defaultValue={initial?.image} placeholder="/assets/laps.jpg" className={inputClass} />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Description</span>
          <textarea name="description" rows={2} defaultValue={initial?.description} className={inputClass} />
        </label>
      </div>

      {/* Variants */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className={labelClass}>Variants (size &amp; price)</span>
          <button
            type="button"
            onClick={() => setVariants((v) => [...v, { label: "", price: 0 }])}
            className="text-xs font-semibold text-primary hover:underline"
          >
            + Add variant
          </button>
        </div>
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={v.label}
                onChange={(e) => setRow(i, "label", e.target.value)}
                placeholder="1kg"
                className={inputClass + " flex-1"}
              />
              <div className="relative w-32 shrink-0">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₦</span>
                <input
                  type="number"
                  min={0}
                  value={v.price || ""}
                  onChange={(e) => setRow(i, "price", e.target.value)}
                  placeholder="0"
                  className={inputClass + " pl-6"}
                />
              </div>
              <button
                type="button"
                onClick={() => setVariants((vs) => (vs.length > 1 ? vs.filter((_, idx) => idx !== i) : vs))}
                aria-label="Remove variant"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={initial ? initial.published : true} className="h-4 w-4 rounded border-border" />
        Published (visible on storefront)
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">{state.success}</p>}
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}

export default function ProductsList({ products }: { products: Product[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const filtered = products.filter((p) => filter === "ALL" || p.category === filter);

  async function handleDelete(p: Product) {
    if (!confirm(`Delete ${p.name}?`)) return;
    setBusyId(p.id);
    const res = await deleteProduct(p.id);
    setBusyId(null);
    if (!res.ok) {
      alert(res.error ?? "Could not delete.");
      return;
    }
    router.refresh();
  }

  const filterOptions = ["ALL", ...categories];

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h2 className="px-1 text-sm font-semibold sm:px-0">Products</h2>
        <div className="flex items-center gap-2">
          {categories.length > 0 && (
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {filterOptions.map((c) => (
                <option key={c} value={c}>
                  {c === "ALL" ? "All categories" : c}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add product</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium">{products.length === 0 ? "No products yet" : "No products in this category"}</p>
          {products.length === 0 && <p className="mt-1 text-sm text-muted-foreground">Tap “Add product” to create one.</p>}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-5 py-2.5 font-medium">Product</th>
                  <th className="px-5 py-2.5 font-medium">Category</th>
                  <th className="px-5 py-2.5 font-medium">Price</th>
                  <th className="px-5 py-2.5 font-medium">Variants</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Thumb src={p.image} name={p.name} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{p.name}</p>
                          {p.description && <p className="truncate text-xs text-muted-foreground">{p.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{p.category || "—"}</td>
                    <td className="px-5 py-3 font-semibold">{priceRange(p.variants)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.variants.length}</td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          "rounded-md px-2 py-0.5 text-[11px] font-semibold " +
                          (p.published ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")
                        }
                      >
                        {p.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(p)} aria-label="Edit" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(p)} disabled={busyId === p.id} aria-label="Delete" className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-border md:hidden">
            {filtered.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-2 py-3">
                <Thumb src={p.image} name={p.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.category || "—"} · {priceRange(p.variants)}
                  </p>
                  <span
                    className={
                      "mt-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold " +
                      (p.published ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")
                    }
                  >
                    {p.published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => setEditing(p)} aria-label="Edit" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(p)} disabled={busyId === p.id} aria-label="Delete" className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {adding && (
        <Modal title="Add product" onClose={() => setAdding(false)}>
          <ProductForm onDone={() => setAdding(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title={`Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <ProductForm initial={editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
    </section>
  );
}
