import { useEffect, useState } from "react";
import { ref, onValue, push, set, remove } from "firebase/database";
import { db } from "../../services/firebase";
import { FiPlus, FiTrash2, FiImage, FiCheckCircle, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import "./AdminLookbook.css";

export default function AdminLookbook() {
  const [looks, setLooks] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]); // Array of product IDs

  useEffect(() => {
    // Fetch Looks
    const lookRef = ref(db, "lookbooks");
    const unsubLooks = onValue(lookRef, (snap) => {
      const data = snap.val() || {};
      setLooks(Object.entries(data).map(([id, val]) => ({ id, ...val })));
    });

    // Fetch Active Products
    const prodRef = ref(db, "products");
    const unsubProds = onValue(prodRef, (snap) => {
      const data = snap.val() || {};
      setProducts(Object.entries(data)
        .map(([id, val]) => ({ id, ...val }))
        .filter(p => p.status === "active")
      );
    });

    return () => { unsubLooks(); unsubProds(); };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !image || selectedProducts.length === 0) {
      return toast.error("Please fill all fields and select at least 1 product.");
    }

    setSaving(true);
    try {
      const newLookRef = push(ref(db, "lookbooks"));
      await set(newLookRef, {
        title,
        campaignLabel: label || "THE AURA EDIT",
        description,
        modelImage: image,
        products: selectedProducts,
        createdAt: Date.now(),
      });
      toast.success("Lookbook created!");
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error("Failed to save lookbook.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle(""); setLabel(""); setDescription(""); setImage(""); setSelectedProducts([]);
  };

  const toggleProduct = (id) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this lookbook?")) {
      await remove(ref(db, `lookbooks/${id}`));
    }
  };

  return (
    <div className="admin-lookbook-page">
      <div className="lookbook-header">
        <div>
          <h1>Shop The Look Manager</h1>
          <p>Create curated outfits and link them to products in your catalog.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Create New Look
        </button>
      </div>

      <div className="lookbook-grid">
        {looks.map(look => (
          <div key={look.id} className="lookbook-card">
            <img src={look.modelImage} alt={look.title} />
            <div className="lookbook-card-info">
              <h3>{look.title}</h3>
              <p>{look.products?.length || 0} Products linked</p>
              <button onClick={() => handleDelete(look.id)} className="delete-btn">
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        ))}
        {looks.length === 0 && <p style={{ padding: '2rem' }}>No lookbooks created yet.</p>}
      </div>

      {isModalOpen && (
        <div className="lookbook-modal-overlay">
          <form className="lookbook-modal" onSubmit={handleSave}>
            <div className="modal-header">
              <h2>Create Lookbook</h2>
              <button type="button" onClick={() => setIsModalOpen(false)}><FiX /></button>
            </div>

            <div className="form-group">
              <label>Look Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. The Autumn Edit" required />
            </div>

            <div className="form-group">
              <label>Campaign Label (Eyebrow)</label>
              <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. THE MODERN GENTLEMAN" />
            </div>

            <div className="form-group">
              <label>Model Image URL</label>
              <input type="url" value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." required />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" />
            </div>

            <div className="form-group">
              <label>Select Products (First 4 will become hotspots)</label>
              <div className="product-selection-list">
                {products.map(p => (
                  <label key={p.id} className={`product-checkbox ${selectedProducts.includes(p.id) ? 'selected' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={selectedProducts.includes(p.id)} 
                      onChange={() => toggleProduct(p.id)} 
                    />
                    <img src={p.image} alt={p.name} />
                    <span>{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary save-look-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Lookbook"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}