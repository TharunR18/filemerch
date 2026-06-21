import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Store, DollarSign, ShoppingBag, Download, Package, Plus, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/seller/dashboard');
        setDashboardData(res.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-20) 0' }}>
          <div className="spinner spinner-lg" />
        </div>
      </div>
    );
  }

  const { summary = {}, recentPurchases = [], analytics = [] } = dashboardData || {};

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>Seller Dashboard</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
              Track your sales, earnings, and manage your digital catalog.
            </p>
          </div>
          <div className="dashboard-header-buttons">
            <Link to="/seller/setup" className="btn btn-secondary">
              <Settings size={16} /> Settings
            </Link>
            <Link to="/dashboard/products" className="btn btn-secondary">
              <Package size={16} /> Manage Products
            </Link>
            <Link to="/dashboard/products/create" className="btn btn-primary">
              <Plus size={16} /> Add Product
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-stats-grid animate-fade-in">
          {/* Revenue */}
          <div className="glass-card" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className="avatar" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <DollarSign size={20} />
            </div>
            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>Total Earnings</p>
              <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginTop: '2px' }}>₹{summary.totalRevenue || 0}</h3>
            </div>
          </div>

          {/* Sales */}
          <div className="glass-card" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className="avatar" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>Total Sales</p>
              <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginTop: '2px' }}>{summary.totalSales || 0}</h3>
            </div>
          </div>

          {/* Products */}
          <div className="glass-card" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className="avatar" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <Store size={20} />
            </div>
            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>Total Products</p>
              <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginTop: '2px' }}>{summary.totalProducts || 0}</h3>
            </div>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="dashboard-sections animate-fade-in">
          {/* Recent Sales */}
          <div className="glass-card dashboard-card">
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Recent Sales</h3>
            {recentPurchases.length > 0 ? (
              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Buyer</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPurchases.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.product?.title || 'Unknown Product'}</span>
                        </td>
                        <td>
                          <div>
                            <p style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{item.buyer?.name || 'Guest User'}</p>
                            {item.buyer?.email && <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{item.buyer.email}</p>}
                          </div>
                        </td>
                        <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                          {new Date(item.purchased_at).toLocaleDateString()}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--color-text-primary)', textAlign: 'right' }}>
                          ₹{item.price_paid}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-6) 0' }}>No sales recorded yet.</p>
            )}
          </div>

          {/* Analytics List */}
          <div className="glass-card dashboard-card">
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Monthly Analytics</h3>
            {analytics.length > 0 ? (
              <div className="dashboard-analytics-grid">
                {analytics.map((month, index) => (
                  <div key={index} className="glass-card dashboard-analytics-card">
                    <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-primary)' }}>{month.label}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Sales:</span>
                      <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{month.sales}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Revenue:</span>
                      <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: '#10b981' }}>₹{month.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-6) 0' }}>Analytics data will populate once sales occur.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
