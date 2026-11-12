import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { saveUserProfile } from '../../services/userService';
import './AuthPage.css';

const SignupPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (password !== confirmPassword) return toast.error("Passwords do not match.");
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");

    setIsLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await signup(email, password);
      const user = userCredential.user;

      // 2. Save profile to Realtime Database
      await saveUserProfile(user.uid, {
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString(),
      });

      // 3. Go straight to the Account Dashboard
      toast.success(`Welcome to AURA, ${firstName}!`);
      navigate('/account');
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error("This email is already registered.");
      } else {
        toast.error(error.message || "Failed to create account.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <motion.div className="auth-image-side" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop" alt="AURA" />
          <div className="auth-image-overlay">
            <h2>Join the AURA Circle.</h2>
          </div>
        </motion.div>

        <motion.div className="auth-form-side" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <div className="auth-form-wrapper">
            <Link to="/" className="auth-logo">AURA.</Link>
            <h1>Create an Account</h1>
            <p>Join us for a more personal AURA experience.</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-form-row">
                <div className="auth-form-group">
                  <label>First Name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="auth-form-group">
                  <label>Last Name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="auth-form-group">
                <label>Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
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
                  <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="auth-form-group">
                <label>Confirm Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    placeholder="••••••••"
                  />
                  <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              
              <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="auth-footer-links">
              <p>Already have an account? <Link to="/login">Sign In</Link></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;