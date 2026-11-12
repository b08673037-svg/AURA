import { ref, push, set, get } from "firebase/database";
import { db } from "./firebase";

// Create a new order in the database
export const createOrder = async (uid, orderData) => {
  try {
    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);
    const orderId = newOrderRef.key;

    const order = {
      orderId,
      userId: uid,
      ...orderData,
      status: 'Pending',          // canonical status field
      orderStatus: 'Pending',     // mirror for backward compatibility
      paymentStatus: 'Pending',   // 'Pending' | 'Paid' | 'Failed' | 'Refunded'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await set(newOrderRef, order);
    return { success: true, orderId };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Fetch orders for a specific user
export const getUserOrders = async (uid) => {
  try {
    const ordersRef = ref(db, 'orders');
    const snapshot = await get(ordersRef);
    
    if (snapshot.exists()) {
      const allOrders = snapshot.val();
      // Filter by userId and sort newest first
      const userOrders = Object.entries(allOrders)
        .map(([id, order]) => ({ id, ...order }))
        .filter(order => order.userId === uid)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return userOrders;
    }
    return [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};