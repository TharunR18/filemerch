import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import EmptyState from '../components/EmptyState';
import { Package, Download, Calendar, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Library = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const res = await API.get('/purchases/my-purchases');
        setPurchases(res.data.purchases || []);
      } catch (err) {
        toast.error('Failed to load library items');
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  const handleDownload = async (productId) => {
    setDownloadingId(productId);
    try {
      const res = await API.get(`/purchases/download/${productId}`);
      window.open(res.data.downloadUrl, '_blank');
      toast.success('Download started!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    } finally {
      setDownloadingId(null);
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
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>My Library</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
            Access all your purchased digital files and downloads.
          </p>
        </div>

        {purchases.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }} className="animate-fade-in">
            {purchases.map((item) => {
              const product = item.product_id;
              if (!product) return null;

              return (
                <div key={item._id} className="glass-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    {product.thumbnail_url ? (
                      <img src={product.thumbnail_url} alt="" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                    ) : (
                      <div style={{ width: '80px', height: '60px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--color-text-muted)' }}>
                        <Package size={24} style={{ margin: 'auto' }} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.title}
                      </h3>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <Calendar size={12} />
                        Purchased {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'auto' }}>
                    <Link to={`/product/${product.slug}`} className="btn btn-secondary btn-sm" style={{ flex: 1, gap: 'var(--space-1)' }}>
                      View Page <ArrowRight size={14} />
                    </Link>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, gap: 'var(--space-1.5)' }}
                      onClick={() => handleDownload(product._id)}
                      disabled={downloadingId === product._id}
                    >
                      <Download size={14} />
                      {downloadingId === product._id ? 'Starting...' : 'Download'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="Library is empty"
            description="You haven't purchased any digital goods yet."
            action={<Link to="/marketplace" className="btn btn-primary">Browse Marketplace</Link>}
          />
        )}
      </div>
    </div>
  );
};

export default Library;
