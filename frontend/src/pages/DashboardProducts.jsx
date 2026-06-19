import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { Package, Plus, Edit3, Upload, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products/myProducts');
      setProducts(res.data.products || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      setProducts(prev => prev.filter(p => p._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-20) 0' }}>
          <div className="spinner spinner-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>Manage Products</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
              Create, update, and manage the digital files you are selling.
            </p>
          </div>
          <Link to="/dashboard/products/create" className="btn btn-primary">
            <Plus size={16} /> Add Product
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="glass-card animate-fade-in" style={{ padding: 'var(--space-6)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-surface-border)' }}>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Product</th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Price</th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Sales</th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>File Status</th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 'var(--font-size-sm)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} style={{ borderBottom: '1px solid var(--color-surface-border)' }}>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          {product.thumbnail_url ? (
                            <img src={product.thumbnail_url} alt="" style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                          ) : (
                            <div style={{ width: '60px', height: '45px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--color-text-muted)' }}>
                              <Package size={18} style={{ margin: 'auto' }} />
                            </div>
                          )}
                          <div>
                            <Link to={`/product/${product.slug}`} style={{ fontWeight: 600, color: 'var(--color-text-primary)', textDecoration: 'none' }} className="hover-underline">
                              {product.title}
                            </Link>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        ₹{product.price}
                      </td>
                      <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                        {product.total_sales || 0}
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        {product.file_key ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: 'var(--font-size-sm)' }}>
                            <CheckCircle size={16} />
                            <span>Ready</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: 'var(--font-size-sm)' }}>
                            <AlertTriangle size={16} />
                            <span>No File Uploaded</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                          <Link to={`/dashboard/products/edit/${product._id}`} className="btn btn-secondary btn-sm" title="Edit Details">
                            <Edit3 size={14} /> Edit
                          </Link>
                          <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setDeleteConfirm(product._id)} style={{ color: 'var(--color-error)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No products yet"
            description="You haven't listed any digital products for sale yet."
            action={<Link to="/dashboard/products/create" className="btn btn-primary"><Plus size={16} /> Add Product</Link>}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone and will delete the product file from storage."
        confirmText="Delete"
        danger
        onConfirm={() => handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};

export default DashboardProducts;
