import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

export interface CartItem {
  productSlug: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  weightGrams?: number;     // Per-item weight in grams; undefined = 250g fallback
  imageFile?: File;
  pendingImageKey?: string; // S3 key for items restored from Redis
  previewUrl?: string;      // Presigned URL for restored image preview
  size?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  saveCart: () => Promise<void>;
  restoreCart: () => Promise<void>;
  clearCartFromServer: () => Promise<void>;
  totalCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function addItem(item: CartItem) {
    setItems(prev => [...prev, item]);
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index));
  }

  function clearCart() {
    setItems([]);
  }

  async function saveCart(): Promise<void> {
    if (items.length === 0) return;

    // Upload any File objects to cart-pending S3, replace with S3 key
    const serialized = await Promise.all(
      items.map(async item => {
        if (item.imageFile) {
          const formData = new FormData();
          formData.append('file', item.imageFile);
          const { key } = await api.uploadFile<{ key: string }>('/api/cart/upload-image', formData);
          return {
            productSlug: item.productSlug,
            productName: item.productName,
            variantName: item.variantName,
            price: item.price,
            quantity: item.quantity,
            weightGrams: item.weightGrams,
            size: item.size,
            pendingImageKey: key,
          };
        }
        return {
          productSlug: item.productSlug,
          productName: item.productName,
          variantName: item.variantName,
          price: item.price,
          quantity: item.quantity,
          weightGrams: item.weightGrams,
          size: item.size,
          pendingImageKey: item.pendingImageKey,
        };
      })
    );

    await api.post('/api/cart/save', { items: serialized });
    setItems([]);
  }

  async function restoreCart(): Promise<void> {
    try {
      const { items: restored } = await api.get<{ items: (CartItem & { previewUrl?: string })[] | null }>('/api/cart/restore');
      if (restored && restored.length > 0) {
        setItems(restored);
      }
    } catch {
      // No cart to restore — silently ignore
    }
  }

  async function clearCartFromServer(): Promise<void> {
    await api.delete('/api/cart');
    setItems([]);
  }

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, clearCart,
      saveCart, restoreCart, clearCartFromServer,
      totalCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
