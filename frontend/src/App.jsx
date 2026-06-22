import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SellerRoute from './components/SellerRoute';

// Pages
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import SellerProfile from './pages/SellerProfile';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import SellerSetup from './pages/SellerSetup';
import Library from './pages/Library';
import Dashboard from './pages/Dashboard';
import DashboardProducts from './pages/DashboardProducts';
import CreateProduct from './pages/CreateProduct';
import EditProduct from './pages/EditProduct';
import UploadProductFile from './pages/UploadProductFile';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="product/:slug" element={<ProductDetails />} />
            <Route path="seller/:username" element={<SellerProfile />} />
            <Route path="login" element={<Login />} />

            {/* Authenticated Routes */}
            <Route path="library" element={<ProtectedRoute><Library /></ProtectedRoute>}/>
            <Route path="seller/setup" element={<ProtectedRoute><SellerSetup /></ProtectedRoute>}/>

            {/* Seller Routes */}
            <Route path="dashboard" element={<SellerRoute><Dashboard /></SellerRoute>}/>
            <Route path="dashboard/products" element={<SellerRoute><DashboardProducts /></SellerRoute>}/>
            <Route path="dashboard/products/create" element={<SellerRoute><CreateProduct /></SellerRoute>}/>
            <Route path="dashboard/products/edit/:id" element={<SellerRoute><EditProduct /></SellerRoute>}/>
            <Route path="dashboard/products/upload/:id" element={<SellerRoute><UploadProductFile /></SellerRoute>}/>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-surface-border)',
            borderRadius: 'var(--radius-lg)'
          }
        }}
      />
    </AuthProvider>
  );
};

export default App;