"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "./types";

export interface CartItem {
  id: string; // unique cart item id (product id + variant string)
  productId: number;
  slug: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  priceDisplay?: string | null;
  quantity: number;
  minimumOrderQuantity: number;
  options?: {
    material?: string;
    size?: string;
    color?: string;
    customText?: string;
    artworkName?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number, options?: CartItem["options"]) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  formattedSubtotal: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "the_print_planet_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to read cart from localStorage", e);
    }
    setMounted(true);
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn("Failed to save cart to localStorage", e);
      }
    }
  }, [items, mounted]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addItem = (product: Product, quantity = 1, options?: CartItem["options"]) => {
    const rawPrice = product.price ? Number(product.price) : 0;
    const moq = product.minimum_order_quantity || 1;
    const finalQty = Math.max(quantity, moq);

    const imageUrl =
      product.primary_image?.secure_url ||
      (product.images && product.images.length > 0 ? product.images[0].secure_url : "/placeholder-product.svg");

    const optionKey = options ? Object.entries(options).map(([k, v]) => `${k}:${v}`).sort().join("|") : "default";
    const itemId = `${product.id}-${optionKey}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === itemId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + finalQty,
        };
        return next;
      }

      const newItem: CartItem = {
        id: itemId,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        sku: product.sku,
        image: imageUrl,
        price: rawPrice,
        priceDisplay: product.price_display,
        quantity: finalQty,
        minimumOrderQuantity: moq,
        options,
      };
      return [...prev, newItem];
    });

    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const finalQty = Math.max(quantity, item.minimumOrderQuantity || 1);
          return { ...item, quantity: finalQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price > 0 ? item.price * item.quantity : 0), 0);
  const formattedSubtotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        formattedSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
