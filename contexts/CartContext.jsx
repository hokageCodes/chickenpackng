// context/CartContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("chickenpack-cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever cart changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("chickenpack-cart", JSON.stringify(cart));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [cart, isLoaded]);

  // Sync cart count when cart changes
  useEffect(() => {
    const total = Object.values(cart).reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    setCartCount(total);
  }, [cart]);

  const addToCart = (productId, size, quantity, name, image) => {
    const key = `${productId}-${size}`;
    setCart((prev) => ({
      ...prev,
      [key]: {
        productId,
        size,
        quantity: (prev[key]?.quantity || 0) + quantity,
        name,
        image,
      },
    }));
  };

  const removeFromCart = (key) => {
    const updated = { ...cart };
    delete updated[key];
    setCart(updated);
  };

  const updateQuantity = (key, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(key);
      return;
    }
    
    setCart((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        quantity: newQuantity,
      },
    }));
  };

  const clearCart = () => {
    setCart({});
  };

  // Don't render children until cart is loaded from localStorage
  if (!isLoaded) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
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
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};