import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import type { CartItem, CartContextType } from "../types";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cart from API on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setCart([]);
          return;
        }
        const res = await api.get("/cart");
        setCart(res.data.items || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load cart:", err);
        setError("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const refreshCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cart");
      setCart(res.data.items || []);
      setError(null);
    } catch (err) {
      console.error("Failed to refresh cart:", err);
      setError("Failed to refresh cart");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (
    productId: string,
    count: number,
    material: string,
    color: string,
  ) => {
    try {
      setLoading(true);
      await api.post("/cart/items", {
        productId,
        count,
        material,
        color,
      });
      await refreshCart();
      setError(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to add item to cart";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setLoading(true);
      await api.delete(`/cart/items/${itemId}`);
      await refreshCart();
      setError(null);
    } catch (err) {
      console.error("Failed to remove from cart:", err);
      setError("Failed to remove item from cart");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (
    itemId: string,
    count?: number,
    material?: string,
    color?: string,
  ) => {
    try {
      setLoading(true);
      await api.put(`/cart/items/${itemId}`, {
        count,
        material,
        color,
      });
      await refreshCart();
      setError(null);
    } catch (err) {
      console.error("Failed to update cart item:", err);
      setError("Failed to update cart item");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await api.delete("/cart");
      setCart([]);
      setError(null);
    } catch (err) {
      console.error("Failed to clear cart:", err);
      setError("Failed to clear cart");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        refreshCart,
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
