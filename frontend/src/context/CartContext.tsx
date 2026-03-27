import React, { createContext, useContext, useState, useEffect } from "react";
import type { OrderItem } from "../types";

interface CartContextType {
  cart: OrderItem[];
  addToCart: (item: OrderItem) => void;
  removeFromCart: (index: number) => void;
  updateCartItem: (index: number, updatedItem: OrderItem) => void; // New function
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Load existing cart from local storage on startup
  const [cart, setCart] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem("print_cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Automatically save to local storage whenever the cart changes
  useEffect(() => {
    localStorage.setItem("print_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: OrderItem) => {
    setCart((prev) => [...prev, item]);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Logic to update a specific item (Quantity, Material, or Color)
  const updateCartItem = (index: number, updatedItem: OrderItem) => {
    setCart((prev) => {
      const newCart = [...prev];
      newCart[index] = updatedItem;
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("print_cart");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook for easy access in components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
