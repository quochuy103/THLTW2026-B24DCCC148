import { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { getStorageData, setStorageData, StorageKeys } from '@/utils/storage';

export type OrderStatus = 'Chờ xử lý' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  products: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'DH001',
    customerName: 'Nguyễn Văn A',
    phone: '0912345678',
    address: '123 Nguyễn Huệ, Q1, TP.HCM',
    products: [{ productId: 1, productName: 'Laptop Dell XPS 13', quantity: 1, price: 25000000 }],
    totalAmount: 25000000,
    status: 'Chờ xử lý',
    createdAt: '2024-01-15'
  }
];

export default function useOrderModel() {
  const [orders, setOrders] = useState<Order[]>(() => 
    getStorageData(StorageKeys.ORDERS, DEFAULT_ORDERS)
  );

  // We need access to product model to update stock
  // IMPORTANT: Circular dependency risk if not handled carefully, 
  // but Umi models are usually flat. We will call product model methods here.
  const { updateStock } = useModel('products');

  // Persist
  useEffect(() => {
    setStorageData(StorageKeys.ORDERS, orders);
  }, [orders]);

  const createOrder = (orderData: Omit<Order, 'id' | 'status' | 'createdAt'>) => {
    // Generate new ID: DH00X
    const maxIdNum = orders.reduce((max, o) => {
      const num = parseInt(o.id.replace('DH', ''), 10);
      return num > max ? num : max;
    }, 0);
    const newId = `DH${String(maxIdNum + 1).padStart(3, '0')}`;
    
    const newOrder: Order = {
      ...orderData,
      id: newId,
      status: 'Chờ xử lý',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setOrders([newOrder, ...orders]);
    return newOrder;
  };

  /**
   * Update Status & Inventory Logic
   * 
   * Transition Rules defined in requirements:
   * - Into "Hoàn thành" => Subtract stock
   * - Out of "Hoàn thành" => Return stock (Add back)
   * - Into "Đã hủy" => Return stock IF it was previously subtracted (i.e. was Hoàn thành)
   *   BUT Wait, simplified logic was:
   *     - "Hoàn thành": subtract stock
   *     - "Đã hủy": return stock (implied: if it was reserved/subtracted)
   * 
   * Let's implement the specific robust logic suggested:
   * Track previous status.
   * If newStatus === 'Hoàn thành' && oldStatus !== 'Hoàn thành':
   *    Subtract stock.
   * If oldStatus === 'Hoàn thành' && newStatus !== 'Hoàn thành':
   *    Add stock back.
   * 
   * Note regarding "Đã hủy":
   * The requirements say: "When status changes to 'Đã hủy': return stock quantities back to inventory."
   * But usually stock is only subtracted when 'Hoàn thành' (or 'Confirmed'). 
   * If we assume 'Chờ xử lý' (Pending) DOES NOT subtract stock yet (as per requirement "When status changes to 'Hoàn thành': subtract stock"),
   * then moving from 'Chờ xử lý' to 'Đã hủy' should change nothing.
   * 
   * However, let's look closer at requirement: 
   * "When status changes to 'Hoàn thành': subtract stock."
   * "When status changes to 'Đã hủy': return stock quantities back to inventory."
   * 
   * This implies if I go Chờ xử lý -> Hoàn thành (Stock -1) -> Đã hủy (Stock +1). Correct.
   * What if Chờ xử lý -> Đã hủy? Stock should change? 
   * If stock wasn't subtracted in Chờ xử lý, then no.
   * 
   * So the logic "If oldStatus === 'Hoàn thành' && newStatus !== 'Hoàn thành': Add stock back" covers the cancellation case from completed.
   * 
   * Is there any case where we reserve stock on creation? Content says: "ordered quantity must NOT exceed current stock" on creation.
   * But it doesn't explicitly say "Subtract on creation". It says "When status changes to 'Hoàn thành': subtract stock".
   * So we will strictly follow: Stock is only physically deducted when Order becomes 'Hoàn thành'.
   */
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;

    const order = orders[orderIndex];
    const oldStatus = order.status;

    if (oldStatus === newStatus) return;

    // 1. Calculate stock impact
    // We want to calculate the 'delta' to apply to the product stock.
    // +1 means add to stock (return), -1 means remove from stock (sell).
    
    let multiplier = 0;

    // Transitioning INTO Completed -> Subtract stock (-1)
    if (newStatus === 'Hoàn thành' && oldStatus !== 'Hoàn thành') {
        multiplier = -1;
    }
    // Transitioning OUT OF Completed -> Return stock (+1)
    else if (oldStatus === 'Hoàn thành' && newStatus !== 'Hoàn thành') {
        multiplier = 1;
    }
    
    // If multiplier is non-zero, apply updates
    if (multiplier !== 0) {
        const stockUpdates = order.products.map(p => ({
            productId: p.productId,
            quantityChange: p.quantity * multiplier
        }));
        updateStock(stockUpdates);
    }

    // 2. Update Order
    const updatedOrder = { ...order, status: newStatus };
    const newOrders = [...orders];
    newOrders[orderIndex] = updatedOrder;
    setOrders(newOrders);
  };

  return {
    orders,
    createOrder,
    updateOrderStatus,
  };
}
