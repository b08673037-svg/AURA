import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#291925', color: '#fff' }}>Loading...</div>;
  }

  // Not logged in -> Go to Admin Login
  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in, but not an admin -> Go to Admin Login
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;