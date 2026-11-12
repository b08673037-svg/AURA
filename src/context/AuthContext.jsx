import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database'; // Added set
import { auth, db } from '../services/firebase';
import { getUserProfile } from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // NEW: Admin Signup Function
  const adminSignup = async (email, password) => {
    // 1. Create user in Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Instantly grant them admin access in the Database
    await set(ref(db, `admins/${user.uid}`), true);
    
    // 3. Also create their base profile
    await set(ref(db, `users/${user.uid}/profile`), {
      email: email,
      role: "admin",
      createdAt: new Date().toISOString()
    });

    return userCredential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);

          const adminSnapshot = await get(ref(db, `admins/${user.uid}`));
          const adminStatus = adminSnapshot.exists() && adminSnapshot.val() === true;
          
          setIsAdmin(adminStatus);
          
        } catch (error) {
          console.error("Auth initialization error:", error);
          setIsAdmin(false);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    signup,
    adminSignup, // Export the new function
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};