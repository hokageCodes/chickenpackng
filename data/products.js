// data/products.js

export const products = [
    {
      id: "full-5kg",
      name: "Full Chicken",
      category: "Full",
      sizes: [
        { label: "1kg", price: 1800 },
        { label: "2kg", price: 3500 },
        { label: "5kg", price: 8000 }
      ],
      image: "/assets/hero-bg.webp",
      description: "Whole broiler chicken, plump and juicy for family feasts."
    },
    {
      id: "laps-2kg",
      name: "Chicken Laps",
      category: "Laps",
      sizes: [
        { label: "1kg", price: 2200 },
        { label: "2kg", price: 4500 },
        { label: "5kg", price: 11000 }
      ],
      image: "/assets/laps.jpg",
      description: "Tender chicken thighs, perfect for grilling or stew."
    },
    {
      id: "wings-1kg",
      name: "Chicken Wings",
      category: "Chest Wings",
      sizes: [
        { label: "1kg", price: 2500 },
        { label: "2kg", price: 4900 },
        { label: "5kg", price: 12000 }
      ],
      image: "/assets/wings.jpg",
      description: "Crispy golden wings — crowd-favorite for all occasions."
    },
    {
      id: "breast-2kg",
      name: "Chicken Breast",
      category: "Chest Wings",
      sizes: [
        { label: "1kg", price: 2400 },
        { label: "2kg", price: 4700 },
        { label: "5kg", price: 11700 }
      ],
      image: "/assets/chi.webp",
      description: "Lean and healthy breast cuts — high in protein, low in fat."
    }
  ];
  