import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '../services/firebase';
import { getUserProfile } from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState("customer"); // <-- NEW
  const [loading, setLoading] = useState(true);

  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  const adminSignup = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await set(ref(db, `admins/${user.uid}`), true);
    await set(ref(db, `users/${user.uid}/profile`), {
      email: email,
      role: "admin",
      createdAt: new Date().toISOString()
    });
    return userCredential;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);

          // Check admin status
          const adminSnapshot = await get(ref(db, `admins/${user.uid}`));
          const adminStatus = adminSnapshot.exists() && adminSnapshot.val() === true;
          setIsAdmin(adminStatus);

          // NEW: Check specific role
          const roleRef = ref(db, `users/${user.uid}/role`);
          const roleSnap = await get(roleRef);
          const role = roleSnap.exists() ? roleSnap.val() : (adminStatus ? "admin" : "customer");
          setUserRole(role);
          
        } catch (error) {
          console.error("Auth initialization error:", error);
          setIsAdmin(false);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setUserRole("customer");
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, isAdmin, userRole, signup, adminSignup, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};