import { useEffect, useState } from "react";
import { ref, onValue, remove, update } from "firebase/database";
import { db } from "../../services/firebase";
import { FiMail, FiTrash2, FiCheckCircle, FiSearch, FiMessageSquare } from "react-icons/fi";
import toast from "react-hot-toast";
import "./AdminMessages.css"; // We'll create this CSS next

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const messagesRef = ref(db, "contactMessages");
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const formatted = Object.entries(data)
        .map(([id, msg]) => ({ id, ...msg }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first
      setMessages(formatted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id) => {
    await update(ref(db, `contactMessages/${id}`), { status: "Read" });
    toast.success("Marked as read");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message permanently?")) return;
    await remove(ref(db, `contactMessages/${id}`));
    toast.success("Message deleted");
  };

  const filteredMessages = messages.filter((msg) => {
    const term = searchTerm.toLowerCase();
    return (
      msg.firstName?.toLowerCase().includes(term) ||
      msg.email?.toLowerCase().includes(term) ||
      msg.message?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="admin-messages-page">
      <div className="messages-header">
        <div>
          <h1>Customer Messages</h1>
          <p>Manage inquiries and support requests from the contact form.</p>
        </div>
        <div className="messages-search">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Search messages..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading messages...</p>
      ) : filteredMessages.length === 0 ? (
        <div className="empty-messages">
          <FiMessageSquare size={48} />
          <h2>No messages found</h2>
          <p>When customers use the contact form, their messages will appear here.</p>
        </div>
      ) : (
        <div className="messages-grid">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className={`message-card ${msg.status === "Unread" ? "unread" : ""}`}>
              <div className="message-top">
                <div>
                  <h3>{msg.firstName} {msg.lastName}</h3>
                  <span className="message-email"><FiMail /> {msg.email}</span>
                </div>
                <div className="message-actions">
                  {msg.status === "Unread" && (
                    <button onClick={() => markAsRead(msg.id)} title="Mark as Read" className="btn-read">
                      <FiCheckCircle /> Mark Read
                    </button>
                  )}
                  <button onClick={() => handleDelete(msg.id)} title="Delete" className="btn-delete">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              
              <div className="message-meta">
                <span><strong>Type:</strong> {msg.inquiryType}</span>
                <span><strong>Date:</strong> {new Date(msg.createdAt).toLocaleDateString()}</span>
                {msg.orderNumber && <span><strong>Order:</strong> {msg.orderNumber}</span>}
              </div>

              <p className="message-body">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;