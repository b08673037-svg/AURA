import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import './AuthPage.css';

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      return toast.error("Please enter the full 6-digit code.");
    }

    setIsLoading(true);
    
    // Simulate verification (This is where you would call your backend)
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Email verified successfully! Welcome to AURA.");
      navigate('/account');
    }, 1500);
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
          <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop" alt="AURA" />
          <div className="auth-image-overlay">
            <h2>One Step Closer.</h2>
          </div>
        </motion.div>

        <motion.div 
          className="auth-form-side"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="auth-form-wrapper" style={{ textAlign: 'center' }}>
            <Link to="/" className="auth-logo">AURA.</Link>
            <h1>Verify Your Email</h1>
            <p>We've sent a 6-digit code to your email address. Enter it below to confirm your account.</p>

            <form onSubmit={handleSubmit} className="otp-form">
              <div className="otp-input-container">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    name="otp"
                    maxLength="1"
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="otp-input"
                  />
                ))}
              </div>
              
              <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading} style={{ marginTop: '2rem' }}>
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>

            <div className="auth-footer-links">
              <p>Didn't receive the code? <a href="#" style={{ color: 'var(--accent-burgundy)', textDecoration: 'underline' }}>Resend</a></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;