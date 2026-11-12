import { useState } from 'react';
import { FiLock, FiBell, FiTrash2, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import './AccountSettings.css';

const AccountSettings = () => {
  // Password state
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  
  // Notification preferences
  const [preferences, setPreferences] = useState({
    orderConfirmation: true,
    shippingUpdates: true,
    deliveryNotifications: true,
    promotionalEmails: false
  });

  // Delete account modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      return toast.error("Passwords do not match.");
    }
    if (passwords.newPass.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }
    // Simulate Firebase update
    toast.success("Password updated successfully!");
    setPasswords({ current: "", newPass: "", confirm: "" });
  };

  const handlePreferenceToggle = (key) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
    toast.success("Preferences updated");
  };

  const handleDeleteAccount = () => {
    toast.error("Account deletion request submitted. Our team will contact you.");
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="account-settings">
      <div className="page-header">
        <h1>Account Settings</h1>
        <p>Manage your password, preferences, and account security.</p>
      </div>

      {/* PASSWORD & SECURITY */}
      <section className="settings-section">
        <div className="section-title">
          <FiLock />
          <h2>Password & Security</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="settings-form">
          <div className="form-group">
            <label>Current Password</label>
            <input 
              type="password" 
              value={passwords.current} 
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} 
              required 
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                value={passwords.newPass} 
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                value={passwords.confirm} 
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} 
                required 
              />
            </div>
          </div>
          <button type="submit" className="btn-primary save-btn">
            <FiSave /> Update Password
          </button>
        </form>
      </section>

      {/* NOTIFICATION PREFERENCES */}
      <section className="settings-section">
        <div className="section-title">
          <FiBell />
          <h2>Notification Preferences</h2>
        </div>
        <div className="preferences-list">
          <div className="preference-item">
            <div>
              <h4>Order Confirmation</h4>
              <p>Receive an email when your order is placed.</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={preferences.orderConfirmation} 
                onChange={() => handlePreferenceToggle('orderConfirmation')} 
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="preference-item">
            <div>
              <h4>Shipping Updates</h4>
              <p>Get notified when your order is shipped.</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={preferences.shippingUpdates} 
                onChange={() => handlePreferenceToggle('shippingUpdates')} 
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="preference-item">
            <div>
              <h4>Delivery Notifications</h4>
              <p>Know when your order is out for delivery.</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={preferences.deliveryNotifications} 
                onChange={() => handlePreferenceToggle('deliveryNotifications')} 
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="preference-item">
            <div>
              <h4>Promotional Emails</h4>
              <p>Receive exclusive offers and new collection updates.</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={preferences.promotionalEmails} 
                onChange={() => handlePreferenceToggle('promotionalEmails')} 
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </section>

      {/* ACCOUNT MANAGEMENT */}
      <section className="settings-section danger-zone">
        <div className="section-title">
          <FiTrash2 />
          <h2>Account Management</h2>
        </div>
        <div className="danger-content">
          <p>Once you delete your account, there is no going back. Please be certain.</p>
          <button className="delete-account-btn" onClick={() => setIsDeleteModalOpen(true)}>
            Delete My Account
          </button>
        </div>
      </section>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Delete Account?"
        message="Are you sure you want to delete your AURA account? All your order history, wishlist, and saved addresses will be permanently removed."
        confirmText="Yes, Delete Account"
        isDestructive={true}
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default AccountSettings;