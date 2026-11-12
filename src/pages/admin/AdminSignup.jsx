import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminLogin.css'; // <-- USING THE SAME ADMIN LOGIN CSS

const AdminSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { adminSignup } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    
    setIsLoading(true);

    try {
      await adminSignup(email, password);
      toast.success("Administrator account created.");
      navigate('/admin/dashboard');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error("This email is already registered.");
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        
        <div className="admin-login-header">
          <h1>AURA<span>.</span></h1>
          <p>LUXURY COMMERCE</p>
        </div>

        <div className="admin-login-form-container">
          <h2>Create Admin Account</h2>
          <p>Register a new administrator for the dashboard.</p>

          <form onSubmit={handleSignup} className="admin-login-form">
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
              {isLoading ? "Creating Account..." : "Register Admin"} 
              {!isLoading && <FiArrowRight />}
            </button>
          </form>
          
          <div className="admin-login-footer" style={{ marginTop: '20px' }}>
            <span style={{ display: 'block', marginBottom: '10px', color: '#85817c' }}>Already an admin?</span>
            <Link to="/admin/login" style={{ color: '#873b4c', fontWeight: 'bold', textDecoration: 'none' }}>Sign In Here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;