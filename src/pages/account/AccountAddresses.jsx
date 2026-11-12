import { useState, useEffect } from 'react';
import { FiMapPin, FiEdit2, FiTrash2, FiPlus, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import CustomSelect from '../../components/common/CustomSelect';
import { useAuth } from '../../context/AuthContext';
import { saveAddress, getUserAddresses, deleteAddress } from '../../services/addressService';
import './AccountAddresses.css';

const AccountAddresses = () => {
  const { currentUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const emptyForm = {
    type: "Home", fullName: "", phone: "", address: "", city: "", state: "", postalCode: "", country: "Pakistan"
  };
  const [formData, setFormData] = useState(emptyForm);

  const addressTypeOptions = [
    { value: "Home", label: "Home" },
    { value: "Office", label: "Office" },
    { value: "Other", label: "Other" }
  ];

  // Fetch addresses on load
  useEffect(() => {
    const fetchAddresses = async () => {
      if (currentUser) {
        const fetched = await getUserAddresses(currentUser.uid);
        setAddresses(fetched);
      }
      setIsLoading(false);
    };
    fetchAddresses();
  }, [currentUser]);

  const handleOpenModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData({ ...address });
    } else {
      setEditingAddress(null);
      setFormData({ ...emptyForm, id: `addr-${Date.now()}` });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    setFormData(emptyForm);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      return toast.error("Please fill in all required fields.");
    }

    try {
      const isDefault = addresses.length === 0 || formData.isDefault;
      const newAddress = { ...formData, isDefault };
      
      await saveAddress(currentUser.uid, newAddress);
      
      // Update local state
      if (editingAddress) {
        setAddresses(addresses.map(a => a.id === editingAddress.id ? newAddress : a));
        toast.success("Address updated");
      } else {
        setAddresses([...addresses, newAddress]);
        toast.success("Address added");
      }
      handleCloseModal();
    } catch (error) {
      toast.error("Failed to save address.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAddress(currentUser.uid, deleteTarget.id);
      setAddresses(addresses.filter(a => a.id !== deleteTarget.id));
      toast.success("Address removed");
      setDeleteTarget(null);
    } catch (error) {
      toast.error("Failed to delete address.");
    }
  };

  const setAsDefault = async (id) => {
    try {
      const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
      // Save all updated addresses to DB
      for (const addr of updated) {
        await saveAddress(currentUser.uid, addr);
      }
      setAddresses(updated);
      toast.success("Default address updated");
    } catch (error) {
      toast.error("Failed to update default address.");
    }
  };

  if (isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading your addresses...</div>;
  }

  return (
    <div className="account-addresses">
      <div className="page-header">
        <div>
          <h1>My Addresses</h1>
          <p>Manage your delivery addresses for a smoother checkout.</p>
        </div>
        <button className="btn-primary add-addr-btn" onClick={() => handleOpenModal()}>
          <FiPlus /> Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="empty-state">
          <FiMapPin size={48} className="empty-icon" />
          <h3>No addresses saved yet</h3>
          <p>Add your delivery address for a smoother checkout.</p>
        </div>
      ) : (
        <div className="addresses-grid">
          {addresses.map(addr => (
            <div key={addr.id} className="address-card">
              {addr.isDefault && <div className="default-badge"><FiCheck /> Default</div>}
              <div className="address-type">{addr.type}</div>
              <h3>{addr.fullName}</h3>
              <p>{addr.address}</p>
              <p>{addr.city}, {addr.state} {addr.postalCode}</p>
              <p>{addr.country}</p>
              <p className="addr-phone">{addr.phone}</p>
              
              <div className="address-actions">
                {!addr.isDefault && <button onClick={() => setAsDefault(addr.id)}>Set Default</button>}
                <button onClick={() => handleOpenModal(addr)}><FiEdit2 /> Edit</button>
                <button onClick={() => setDeleteTarget(addr)}><FiTrash2 /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} />
            <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}>
              <motion.div className="address-modal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <h2>{editingAddress ? "Edit Address" : "Add New Address"}</h2>
                <form onSubmit={handleSave} className="address-form">
                  <div className="form-row">
                    <div className="form-group">
                      <CustomSelect 
                        label="Address Type"
                        options={addressTypeOptions}
                        value={formData.type}
                        onChange={(val) => setFormData({ ...formData, type: val })}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Street Address *</label>
                      <input type="text" name="address" value={formData.address} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input type="text" name="state" value={formData.state} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Postal Code</label>
                      <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                    <button type="submit" className="btn-primary">Save Address</button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={!!deleteTarget}
        title="Delete Address?"
        message="Are you sure you want to remove this address?"
        confirmText="Yes, Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AccountAddresses;