import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SellerRoute = ({ children }) => {
  const { isSeller, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isSeller) {
    return <Navigate to="/seller/setup" replace />;
  }

  return children;
};

export default SellerRoute;
