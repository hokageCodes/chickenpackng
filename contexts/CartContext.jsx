"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();
const STORAGE_KEY = "proteinpack-cart";

export const CartProvider = ({ children }) => {
  // cart: { [id]: { id, name, type, unit, price, image, qty } }
  const [cart, setCart] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch (err) {
      console.error("Error loading cart:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error("Error saving cart:", err);
    }
  }, [cart, isLoaded]);

  const addItem = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev[product.id];
      return {
        ...prev,
        [product.id]: {
          id: product.id,
          name: product.name,
          type: product.type,
          unit: product.unit,
          price: product.price,
          image: product.image ?? null,
          qty: (existing?.qty || 0) + qty,
        },
      };
    });
  };

  const removeItem = (id) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeItem(id);
    setCart((prev) => ({ ...prev, [id]: { ...prev[id], qty } }));
  };

  const clearCart = () => setCart({});

  const items = useMemo(() => Object.values(cart), [cart]);
  const cartCount = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        cartCount,
        subtotal,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
