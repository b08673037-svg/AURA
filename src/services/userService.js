import { ref, set, get } from "firebase/database";
import { db } from "./firebase";

export const saveUserProfile = async (uid, data) => {
  try {
    await set(ref(db, `users/${uid}/profile`), data);
    return { success: true };
  } catch (error) {
    console.error("Error saving profile:", error);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  try {
    const snapshot = await get(ref(db, `users/${uid}/profile`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};