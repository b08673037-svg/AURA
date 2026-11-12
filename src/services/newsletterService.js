import { ref, set, get, child } from "firebase/database";
import { db } from "./firebase"; // Importing our existing Firebase DB

export const subscribeToNewsletter = async (email) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // 1. Check if the email already exists
    // Note: In a production app with high traffic, you would use a secure index or Cloud Function.
    // For this demo, we will check the newsletterSubscribers node.
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `newsletterSubscribers`));
    
    if (snapshot.exists()) {
      const subscribers = snapshot.val();
      const isDuplicate = Object.values(subscribers).some(
        (sub) => sub.email === normalizedEmail
      );
      
      if (isDuplicate) {
        throw new Error("DUPLICATE_EMAIL");
      }
    }

    // 2. Save the new subscriber
    const newSubscriberRef = ref(db, `newsletterSubscribers/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    await set(newSubscriberRef, {
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
      status: "active",
      source: "homepage_footer"
    });

    return { success: true };
  } catch (error) {
    console.error("Newsletter Error:", error);
    if (error.message === "DUPLICATE_EMAIL") {
      throw new Error("This email is already part of the Inner Circle.");
    }
    throw new Error("Something went wrong. Please try again.");
  }
};