import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiHome, FiBarChart2, FiShoppingBag, FiUsers, FiBox,
  FiTag, FiDollarSign, FiSettings, FiLogOut, FiSearch,
  FiBell, FiMenu, FiX, FiChevronLeft, FiChevronRight,
  FiCommand, FiArrowUpRight, FiImage, FiMail, FiUserPlus
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "./AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { logout, userRole } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully signed out");
      navigate("/admin/login");
    } catch (error) {
      toast.error("Unable to sign out. Please try again.");
    }
  };

  const isCashier = userRole === "cashier";

  // Define navigation based on Role
  const navGroups = [
    {
      title: "OVERVIEW",
      items: [
        { path: "/admin/dashboard", label: "Dashboard", icon: <FiHome /> },
        ...(!isCashier ? [{ path: "/admin/analytics", label: "Sales Analytics", icon: <FiBarChart2 /> }] : [])
      ]
    },
    {
      title: "COMMERCE",
      items: [
        { path: "/admin/products", label: "Products", icon: <FiShoppingBag /> },
        { path: "/admin/lookbooks", label: "Shop The Look", icon: <FiImage /> },
        { path: "/admin/orders", label: "Order Management", icon: <FiBox /> },
        { path: "/admin/inventory", label: "Inventory", icon: <FiTag /> }
      ]
    },
    {
      title: "CUSTOMER & BUSINESS",
      items: [
        { path: "/admin/customers", label: "Customers", icon: <FiUsers /> },
        { path: "/admin/messages", label: "Messages", icon: <FiMail /> },
        // Only show these if NOT a cashier
        ...(!isCashier ? [
          { path: "/admin/marketing", label: "Marketing", icon: <FiArrowUpRight /> },
          { path: "/admin/finance", label: "Financial Reports", icon: <FiDollarSign /> },
          { path: "/admin/team", label: "Team Management", icon: <FiUserPlus /> }
        ] : [])
      ]
    },
    {
      title: "PREFERENCES",
      items: [
        { path: "/admin/settings", label: "Settings", icon: <FiSettings /> }
      ]
    }
  ];

  return (
    <div className={`admin-layout ${collapsed ? "sidebar-collapsed" : ""}`}>

      {mobileOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="admin-brand">
            <h2>AURA<span>.</span></h2>
            {!collapsed && <p>LUXURY COMMERCE</p>}
          </div>

          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>

          <button
            className="mobile-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        <div className="sidebar-store">
          <div className="store-mark">A</div>
          {!collapsed && (
            <div>
              <strong>AURA Store</strong>
              <span>{isCashier ? "Cashier Portal" : "Admin Console"}</span>
            </div>
          )}
          {!collapsed && <span className="store-status" />}
        </div>

        <nav className="admin-nav">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.title}>
              {!collapsed && <p className="nav-group-title">{group.title}</p>}

              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin/dashboard"}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : ""}
                  className={({ isActive }) =>
                    `admin-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.path === "/admin/orders" && (
                    <span className="nav-arrow">↗</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <span className="help-symbol">?</span>
            {!collapsed && (
              <div>
                <strong>Need assistance?</strong>
                <span>Visit support center</span>
              </div>
            )}
          </div>

          <button className="admin-logout-btn" onClick={handleLogout}>
            <FiLogOut />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <FiMenu />
            </button>

            <div className="global-search">
              <FiSearch />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search anything..."
                aria-label="Search"
              />
              <span className="search-shortcut">
                <FiCommand /> K
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <span className="topbar-date">
              {new Date().toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric"
              })}
            </span>

            <button
              className="topbar-icon-btn"
              aria-label="Notifications"
              onClick={() => toast("Notifications will appear here.")}
            >
              <FiBell />
              <i />
            </button>

            <div className="topbar-profile">
              <div className="profile-avatar">{isCashier ? "C" : "A"}</div>
              <div className="profile-details">
                <strong>{isCashier ? "Cashier" : "Administrator"}</strong>
                <span>{isCashier ? "Order Processing" : "Store Management"}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet context={{ search }} />
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;