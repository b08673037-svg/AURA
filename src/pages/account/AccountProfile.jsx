import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { saveUserProfile } from '../../services/userService';
import './AccountProfile.css';

const AccountProfile = () => {
  const { currentUser, userProfile } = useAuth();
  
  const [user, setUser] = useState({
    firstName: userProfile?.firstName || "",
    lastName: userProfile?.lastName || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone || ""
  });

  // Update local state when profile loads
  useEffect(() => {
    if (userProfile) {
      setUser({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || ""
      });
    }
  }, [userProfile]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSaving(true);
    try {
      // Save to Firebase Realtime DB
      await saveUserProfile(currentUser.uid, {
        ...formData,
        createdAt: userProfile?.createdAt || new Date().toISOString()
      });
      
      setUser({ ...formData });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...user });
    setIsEditing(false);
  };

  return (
    <div className="account-profile">
      <div className="page-header">
        <h1>Personal Information</h1>
        <p>Manage your personal details and contact information.</p>
      </div>

      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-avatar">
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <div>
            <h2>{user.firstName} {user.lastName}</h2>
            <p>Customer since {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Today'}</p>
          </div>
          {!isEditing && (
            <button className="btn-secondary edit-btn" onClick={() => setIsEditing(true)}>
              <FiEdit2 /> Edit Profile
            </button>
          )}
        </div>

        <div className="profile-card-body">
          {isEditing ? (
            <form onSubmit={handleSave} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} disabled />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCancel}>
                  <FiX /> Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  <FiSave /> {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info-grid">
              <div className="info-item">
                <FiUser className="info-icon" />
                <div>
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{user.firstName} {user.lastName}</span>
                </div>
              </div>
              <div className="info-item">
                <FiMail className="info-icon" />
                <div>
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{user.email}</span>
                </div>
              </div>
              <div className="info-item">
                <FiPhone className="info-icon" />
                <div>
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">{user.phone || "Not provided"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;