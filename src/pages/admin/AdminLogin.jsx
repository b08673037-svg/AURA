import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '../../services/firebase';
import { FiLock, FiMail, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AdminLogin.css'; // <-- FIXED IMPORT

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Check if this user is in the `admins` node
      const adminSnapshot = await get(ref(db, `admins/${user.uid}`));
      const isUserAdmin = adminSnapshot.exists() && adminSnapshot.val() === true;

      if (isUserAdmin) {
        toast.success("Welcome back, Administrator.");
        navigate('/admin/dashboard');
      } else {
        // If they are a valid user but NOT an admin, kick them out
        await auth.signOut();
        toast.error("Access Denied. You do not have administrator privileges.");
      }
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/invalid-credential') {
        toast.error("Invalid email or password.");
      } else {
        toast.error("Authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        
        {/* Brand Header */}
        <div className="admin-login-header">
          <h1>AURA<span>.</span></h1>
          <p>LUXURY COMMERCE</p>
        </div>

        <div className="admin-login-form-container">
          <h2>Administrator Access</h2>
          <p>Sign in to manage your store, orders, and inventory.</p>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="admin-input-group">
              <label>Email Address</label>
              <div className="admin-input-wrap">
                <FiMail className="input-icon" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="admin@aura.com"
                />
              </div>
            </div>
            
            <div className="admin-input-group">
              <label>Password</label>
              <div className="admin-input-wrap">
                <FiLock className="input-icon" />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <button type="submit" className="admin-login-btn" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Sign In to Dashboard"} 
              {!isLoading && <FiArrowRight />}
            </button>
          </form>
          
          <div className="admin-login-footer" style={{ marginTop: '20px' }}>
            <span style={{ display: 'block', marginBottom: '10px', color: '#85817c' }}>Need a new admin account?</span>
            <Link to="/admin/signup" style={{ color: '#873b4c', fontWeight: 'bold', textDecoration: 'none' }}>Register Here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;