import { ref, set, remove, get } from "firebase/database";
import { db } from "./firebase";

// Save an address to the user's address list
export const saveAddress = async (uid, address) => {
  try {
    // We use the ID to create a unique key under users/{uid}/addresses
    const addressRef = ref(db, `users/${uid}/addresses/${address.id}`);
    await set(addressRef, address);
    return { success: true };
  } catch (error) {
    console.error("Error saving address:", error);
    throw error;
  }
};

// Fetch all addresses for a user
export const getUserAddresses = async (uid) => {
  try {
    const snapshot = await get(ref(db, `users/${uid}/addresses`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.entries(data).map(([id, address]) => ({ id, ...address }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }
};

// Delete an address
export const deleteAddress = async (uid, addressId) => {
  try {
    await remove(ref(db, `users/${uid}/addresses/${addressId}`));
    return { success: true };
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};