import { useState, useEffect } from 'react';
import { getStorageData, setStorageData, StorageKeys } from '@/utils/storage';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

const DEFAULT_PRODUCTS: Product[] = [
  { id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', price: 25000000, quantity: 15 },
  { id: 2, name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: 30000000, quantity: 8 },
  { id: 3, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', category: 'Máy tính bảng', price: 18000000, quantity: 5 },
  { id: 5, name: 'MacBook Air M3', category: 'Laptop', price: 28000000, quantity: 12 },
  { id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
  { id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
  { id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 2500000, quantity: 25 },
];

export default function useProductModel() {
  const [products, setProducts] = useState<Product[]>(() => 
    getStorageData(StorageKeys.PRODUCTS, DEFAULT_PRODUCTS)
  );

  // Persist whenever products change
  useEffect(() => {
    setStorageData(StorageKeys.PRODUCTS, products);
  }, [products]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    // Generate simple numeric ID based on max existing ID
    const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
    const newProduct = { ...product, id: maxId + 1 };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: number, updatedInfo: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedInfo } : p))
    );
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  /**
   * Helper to batch update stock.
   * Positive quantities add to stock, negative quantities subtract.
   */
  const updateStock = (items: { productId: number; quantityChange: number }[]) => {
    setProducts((prev) =>
      prev.map((p) => {
        const item = items.find((i) => i.productId === p.id);
        if (item) {
          // Ensure we don't go below zero if logically that happens, 
          // though validation should prevent this at the order creation step.
          const newQty = Math.max(0, p.quantity + item.quantityChange);
          return { ...p, quantity: newQty };
        }
        return p;
      })
    );
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
  };
}
