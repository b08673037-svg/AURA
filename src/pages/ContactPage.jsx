import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiArrowLeft, FiChevronRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { saveAddress } from '../services/addressService';
import ConfirmModal from '../components/common/ConfirmModal';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, coupon, discountAmount, clearCart } = useCart();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '', phone: '', firstName: '', lastName: '', 
    address: '', city: '', state: '', postalCode: '',
    shippingMethod: 'standard', paymentMethod: 'cod', notes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const formatPrice = (price) => `PKR ${price.toLocaleString()}`;

  // Shipping cost & final total (single source of truth)
  const shippingCost = subtotal > 5000 ? 0 : 250;
  const orderTotal = subtotal - (discountAmount || 0) + shippingCost;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    if (!currentUser) {
      return toast.error("Please log in to place an order.");
    }
    
    setIsProcessing(true);

    try {
      // 1. Build the address object
      const addressData = {
        id: `addr-${Date.now()}`,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: "Pakistan",
        type: "Home",
        isDefault: true
      };
      
      // 2. Save the address to the user's profile
      await saveAddress(currentUser.uid, addressData);

      // 3. Build the order object
      const orderData = {
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        deliveryAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: "Pakistan"
        },
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          image: item.image,
          category: item.category,   // keep this so admin analytics can group
        })),
        subtotal,
        discount: discountAmount || 0,
        couponCode: coupon?.code || null,
        shipping: shippingCost,
        total: orderTotal,
        paymentMethod: "Cash on Delivery",
        notes: formData.notes || ""
      };

      // 4. Create the order
      const result = await createOrder(currentUser.uid, orderData);
      
      if (result.success) {
        setOrderId(result.orderId);
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessConfirm = () => {
    setIsSuccessModalOpen(false);
    if (clearCart) clearCart(); 
    navigate('/account/orders');
  };

  // Inline styles for the layout
  const layoutStyle = { display: 'flex', alignItems: 'flex-start', gap: '4rem', width: '100%' };
  const leftColStyle = { flex: '1 1 60%', minWidth: '0' };
  const rightColStyle = { flex: '0 0 400px', width: '400px', position: 'sticky', top: '120px' };
  const summaryCardStyle = { backgroundColor: '#F8F5F0', padding: '2.5rem', borderRadius: '4px', width: '100%', boxSizing: 'border-box' };

  if (cartItems.length === 0 && !isSuccessModalOpen) {
    return (
      <div className="checkout-empty-page">
        <h2>Your Bag Is Waiting.</h2>
        <p>Add some items to your cart before checking out.</p>
        <Link to="/collections" className="btn-primary">Explore Collections</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">
      <header className="checkout-header">
        <Link to="/" className="checkout-logo">AURA.</Link>
        <Link to="/cart" className="back-to-cart"><FiArrowLeft /> Back to Cart</Link>
      </header>

      <div className="checkout-progress-bar">
        <div className="progress-step"><span>1</span> Bag</div>
        <FiChevronRight />
        <div className="progress-step active"><span>2</span> Delivery</div>
        <FiChevronRight />
        <div className="progress-step"><span>3</span> Payment</div>
        <FiChevronRight />
        <div className="progress-step"><span>4</span> Confirmation</div>
      </div>

      <div style={layoutStyle}>
        <div style={leftColStyle}>
          <div className="checkout-intro">
            <h1>Almost Yours.</h1>
            <p>Complete your details below and we'll take care of the rest.</p>
          </div>

          <form id="checkout-form" onSubmit={handleSubmit}>
            <section className="checkout-section">
              <h2>Contact Information</h2>
              <div className="form-row">
                <div className="form-group"><label>Email Address</label><input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="you@example.com" /></div>
                <div className="form-group"><label>Phone Number</label><input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+92 300 1234567" /></div>
              </div>
            </section>

            <section className="checkout-section">
              <h2>Delivery Address</h2>
              <div className="form-row">
                <div className="form-group"><label>First Name</label><input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} /></div>
                <div className="form-group"><label>Last Name</label><input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Street Address</label><input type="text" name="address" required value={formData.address} onChange={handleChange} placeholder="House/Apartment, Street" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>City</label><input type="text" name="city" required value={formData.city} onChange={handleChange} /></div>
                <div className="form-group"><label>State/Province</label><input type="text" name="state" required value={formData.state} onChange={handleChange} /></div>
                <div className="form-group"><label>Postal Code</label><input type="text" name="postalCode" required value={formData.postalCode} onChange={handleChange} /></div>
              </div>
            </section>

            <section className="checkout-section">
              <h2>Shipping Method</h2>
              <div className="shipping-options">
                <label className={`shipping-option ${formData.shippingMethod === 'standard' ? 'selected' : ''}`}>
                  <input type="radio" name="shippingMethod" value="standard" checked={formData.shippingMethod === 'standard'} onChange={handleChange} />
                  <div><strong>Standard Delivery</strong><span>3-5 Business Days</span></div>
                  <span className="shipping-price">{shippingCost === 0 ? "Free" : `PKR ${shippingCost}`}</span>
                </label>
              </div>
            </section>

            <section className="checkout-section">
              <h2>Payment Method</h2>
              <div className="payment-options">
                <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="cod" 
                    checked={formData.paymentMethod === 'cod'} 
                    onChange={handleChange} 
                  />
                  <div>
                    <strong>Cash on Delivery</strong>
                    <span>Pay when your order arrives</span>
                  </div>
                </label>
              </div>
            </section>
          </form>
        </div>

        <div style={rightColStyle}>
          <div style={summaryCardStyle}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: '2rem' }}>Order Summary</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '320px', overflowY: 'auto' }}>
              {cartItems.map(item => (
                <div key={`${item.id}-${item.selectedSize}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                  <img src={item.image} alt={item.name} style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: '#888' }}>{item.selectedSize} × {item.quantity}</span>
                  </div>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(37, 37, 37, 0.1)', margin: '1.5rem 0' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: '#555', marginBottom: '1rem' }}>
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: '#555', marginBottom: '1rem' }}>
              <span>Shipping</span><span>{shippingCost === 0 ? "Free" : `PKR ${shippingCost}`}</span>
            </div>
            
            <div style={{ height: '1px', backgroundColor: 'rgba(37, 37, 37, 0.1)', margin: '1.5rem 0' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'DM Sans, sans-serif', fontSize: '1.2rem', fontWeight: 600, color: '#252525', marginBottom: '2rem' }}>
              <span>Total</span><span>{formatPrice(orderTotal)}</span>
            </div>

            <button 
              type="submit" 
              form="checkout-form" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1.1rem', borderRadius: '4px', fontSize: '0.95rem', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: '#873B4C', color: 'white' }}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Place My Order"} <FiLock />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isSuccessModalOpen}
        title="Order Confirmed!"
        message={`Thank you, ${formData.firstName || 'Customer'}. Your order #${orderId} has been placed successfully.`}
        confirmText="OK" 
        onConfirm={handleSuccessConfirm} 
        onCancel={handleSuccessConfirm}
      />
    </div>
  );
};

export default CheckoutPage;