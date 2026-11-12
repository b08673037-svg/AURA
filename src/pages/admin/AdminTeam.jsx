import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "../../services/firebase";
import { FiUser, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import "./AdminTeam.css";

const AdminTeam = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const usersRef = ref(db, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const formatted = Object.entries(data).map(([id, user]) => {
        const profile = user.profile || user;
        return {
          id,
          email: profile.email || user.email || "No email",
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          role: profile.role || user.role || "customer",
        };
      });
      setUsers(formatted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (uid, newRole) => {
    setUpdatingId(uid);
    try {
      const updates = {};
      // Update role in both places to be safe
      updates[`users/${uid}/role`] = newRole;
      updates[`users/${uid}/profile/role`] = newRole;

      await update(ref(db), updates);

      // Update Admin privileges node
      const adminRef = ref(db, `admins/${uid}`);
      if (newRole === "admin") {
        await update(adminRef, { true: true });
      } else {
        await update(adminRef, { true: null });
      }

      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(term) ||
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term)
    );
  });

  if (loading) return <div style={{ padding: '3rem' }}>Loading team...</div>;

  return (
    <div className="admin-team-page">
      <div className="team-header">
        <div>
          <h1>Team Management</h1>
          <p>Manage dashboard access and assign roles to your staff.</p>
        </div>
        <div className="team-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="team-grid">
        {filteredUsers.map((user) => (
          <div key={user.id} className="team-card">
            
            {/* Left Side: Avatar and Info */}
            <div className="team-user-info">
              <div className="team-avatar">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : <FiUser />}
              </div>
              <div>
                <h3>{user.firstName} {user.lastName}</h3>
                <p>{user.email}</p>
              </div>
            </div>

            {/* Right Side: Role Dropdown */}
            <div className="team-role-controls">
              <label>ACCESS LEVEL</label>
              <div className="select-wrapper">
                <select 
                  value={user.role} 
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={updatingId === user.id}
                  className={`role-select ${user.role}`}
                >
                  <option value="customer">Customer (No Access)</option>
                  <option value="cashier">Cashier (Orders & Products)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>
              {updatingId === user.id && <span className="updating-text">Updating...</span>}
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTeam;