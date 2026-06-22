// Protein Pack public storefront config — edit brand details in one place.

export const SITE = {
  name: "Protein Pack",
  // Owner's WhatsApp number, international format, digits only (no "+", no spaces).
  // Set NEXT_PUBLIC_WHATSAPP_NUMBER in env to override without code changes.
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348000000000",
  whatsappMessage: "Hello Protein Pack! I'd like to place an order.",
};

// Primary navigation. "Shop" points to the public catalog (/products);
// /shop is the protected admin and must NOT be linked here.
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/delivery", label: "Delivery" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function whatsappHref(message = SITE.whatsappMessage) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}
