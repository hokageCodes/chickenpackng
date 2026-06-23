// Curated "Popular Products" for the homepage section.
// Hardcoded for now (not from the DB). Prices are editable placeholders where noted.
//   type: "Chicken" | "Fish" | "Eggs"  -> drives the filter tabs
//   form: "Live" | "Processed" | "Fresh" -> shown as a badge
//   image: path under /public, or null to show a branded placeholder until a real photo exists

export const PRODUCT_TYPES = ['All', 'Chicken', 'Fish', 'Eggs'];

export const popularProducts = [
  {
    id: 'chicken-laps',
    name: 'Chicken Laps',
    type: 'Chicken',
    form: 'Processed',
    price: 5500,
    unit: 'kg',
    image: '/assets/laps.jpg',
    blurb: 'Tender thighs, perfect for grilling, frying or stew.',
  },
  {
    id: 'chicken-breast',
    name: 'Chicken Breast',
    type: 'Chicken',
    form: 'Processed',
    price: 6000,
    unit: 'kg',
    image: '/assets/chi.webp',
    blurb: 'Lean, high-protein breast cuts, clean and trimmed.',
  },
  {
    id: 'chicken-wings',
    name: 'Chicken Wings',
    type: 'Chicken',
    form: 'Processed',
    price: 7000,
    unit: 'kg',
    image: '/assets/wings.jpg',
    blurb: 'Crispy crowd-favourite wings for every occasion.',
  },
  {
    id: 'live-chicken',
    name: 'Live Chicken',
    type: 'Chicken',
    form: 'Live',
    price: 3500, // editable placeholder, per kg
    unit: 'kg',
    minNote: 'From 200kg',
    image: '/assets/hen.webp',
    blurb: 'Healthy live broilers, supplied in bulk to order.',
  },
  {
    id: 'smoked-catfish',
    name: 'Smoked Catfish',
    type: 'Fish',
    form: 'Processed',
    price: 20000,
    unit: 'kg',
    image: null,
    blurb: 'Rich, smoky catfish, cleaned and ready to cook.',
  },
  {
    id: 'live-catfish',
    name: 'Live Catfish',
    type: 'Fish',
    form: 'Live',
    price: 4000, // editable placeholder, per kg
    unit: 'kg',
    minNote: 'From 200kg',
    image: null,
    blurb: 'Fresh, live catfish supplied in bulk to order.',
  },
  {
    id: 'crate-of-eggs',
    name: 'Crate of Eggs',
    type: 'Eggs',
    form: 'Fresh',
    price: 5500,
    unit: 'crate',
    image: null,
    blurb: 'Farm-fresh eggs sold by the crate.',
  },
];
