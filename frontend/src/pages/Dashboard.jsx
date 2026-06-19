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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>Seller Dashboard</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
              Track your sales, earnings, and manage your digital catalog.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Link to="/dashboard/products" className="btn btn-secondary">
              <Package size={16} /> Manage Products
            </Link>
            <Link to="/dashboard/products/create" className="btn btn-primary">
              <Plus size={16} /> Add Product
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }} className="animate-fade-in">
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

          {/* Downloads */}
          <div className="glass-card" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className="avatar" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <Download size={20} />
            </div>
            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>Downloads</p>
              <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginTop: '2px' }}>{summary.totalDownloads || 0}</h3>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-8)' }} className="animate-fade-in">
          {/* Recent Sales */}
          <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Recent Sales</h3>
            {recentPurchases.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-surface-border)' }}>
                      <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Product</th>
                      <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Buyer</th>
                      <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Date</th>
                      <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--font-size-sm)', textAlign: 'right' }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPurchases.map((item) => (
                      <tr key={item._id} style={{ borderBottom: '1px solid var(--color-surface-border)' }}>
                        <td style={{ padding: 'var(--space-4)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.product?.title || 'Unknown Product'}</span>
                        </td>
                        <td style={{ padding: 'var(--space-4)' }}>
                          <div>
                            <p style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{item.buyer?.name || 'Guest User'}</p>
                            {item.buyer?.email && <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{item.buyer.email}</p>}
                          </div>
                        </td>
                        <td style={{ padding: 'var(--space-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                          {new Date(item.purchased_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: 'var(--space-4)', fontWeight: 700, color: 'var(--color-text-primary)', textAlign: 'right' }}>
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
          <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Monthly Analytics</h3>
            {analytics.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
                {analytics.map((month, index) => (
                  <div key={index} className="glass-card" style={{ padding: 'var(--space-4)', background: 'var(--color-bg-secondary)' }}>
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
