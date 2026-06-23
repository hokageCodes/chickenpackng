// Delivery zones, shared by the Delivery page and Checkout.
// Edit fees / areas / minimums here (or wire to the DeliveryZone admin model later).
// fee === null means the fee is confirmed after the order (e.g. outside Lagos).

export const zones = [
  {
    id: "mainland",
    name: "Lagos Mainland",
    areas: "Yaba, Surulere, Ikeja, Maryland, Gbagada, Ojota and nearby areas.",
    fee: 2500,
    minOrder: 10000,
    eta: "Same day",
  },
  {
    id: "island",
    name: "Lagos Island",
    areas: "Lekki, Victoria Island, Ikoyi, Ajah and nearby areas.",
    fee: 3500,
    minOrder: 15000,
    eta: "Same day / next day",
  },
  {
    id: "outside",
    name: "Outside Lagos",
    areas: "Ogun, Ibadan and beyond, by arrangement.",
    fee: null,
    minOrder: 50000,
    eta: "Scheduled",
  },
];

export const getZone = (id) => zones.find((z) => z.id === id) ?? null;
