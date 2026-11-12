import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi'; 
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './AuthPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      // Sign in the user
      const userCredential = await login(email, password);
      const user = userCredential.user;

      // Check if they are in the admins list
      // We can check the DB directly here to know where to redirect
      const { getDatabase, ref, get } = await import('firebase/database');
      const db = getDatabase();
      const adminSnapshot = await get(ref(db, `admins/${user.uid}`));
      const isUserAdmin = adminSnapshot.exists() && adminSnapshot.val() === true;

      toast.success("Welcome back to AURA.");
      
      // Redirect based on role
      if (isUserAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/account');
      }
      
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        toast.error("Invalid email or password.");
      } else {
        toast.error(error.message || "Failed to log in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        
        <motion.div 
          className="auth-image-side"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop" alt="AURA" />
          <div className="auth-image-overlay">
            <h2>Timeless Style.<br/>Everyday Confidence.</h2>
          </div>
        </motion.div>

        <motion.div 
          className="auth-form-side"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="auth-form-wrapper">
            <Link to="/" className="auth-logo">AURA.</Link>
            <h1>Welcome Back</h1>
            <p>Log in to access your personal AURA space.</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="you@example.com"
                />
              </div>
              
              <div className="auth-form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              
              <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="auth-footer-links">
              <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
              <Link to="/forgot-password" className="forgot-link">Forgot your password?</Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default LoginPage;