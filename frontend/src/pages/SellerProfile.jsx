import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { User, Globe, Calendar, Package, Settings } from 'lucide-react';
import { FaTwitter, FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SellerProfile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      setLoading(true);
      try {
        // Fetch seller details
        const sellerRes = await API.get(`/seller/${username}`);
        const sellerObj = sellerRes.data.seller;
        setSeller(sellerObj);

        // Fetch products and filter by this seller
        const productsRes = await API.get('/products');
        const activeProducts = productsRes.data.products || [];
        setProducts(activeProducts.filter(p => p.seller_id?._id === sellerObj._id));
      } catch (err) {
        toast.error('Failed to load seller profile');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [username]);

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <ProductGridSkeleton />
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            icon={User}
            title="Seller not found"
            description="We couldn't find a seller store with that username."
            action={<Link to="/marketplace" className="btn btn-primary">Browse Marketplace</Link>}
          />
        </div>
      </div>
    );
  }

  const joinDate = new Date(seller.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="page">
      <div className="container">
        {/* Seller Info Header */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', alignItems: 'center', textAlign: 'center' }}>
            <UserAvatar user={seller} className="avatar avatar-xl" size={96} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>{seller.name}</h1>
              <p style={{ color: 'var(--color-primary)', fontWeight: 600 }}>@{seller.username}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-1-5)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-1)' }}>
                <Calendar size={12} />
                <span>Joined {joinDate}</span>
              </div>
            </div>

            {seller.bio && (
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', lineHeight: 1.6 }}>
                {seller.bio}
              </p>
            )}

            {/* Social & Contact Links */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center' }}>
              {user && seller && user._id === seller._id && (
                <Link to="/seller/setup" className="btn btn-secondary btn-sm" style={{ gap: 'var(--space-2)' }}>
                  <Settings size={14} /> Edit Profile
                </Link>
              )}
              {seller.website && (
                <a href={seller.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ gap: 'var(--space-2)' }}>
                  <Globe size={14} /> Website
                </a>
              )}
              {seller.twitter && (
                <a href={`https://twitter.com/${seller.twitter}`} target="_blank" rel="noopener noreferrer" className="btn btn-icon btn-secondary btn-sm">
                  <FaTwitter size={14} />
                </a>
              )}
              {seller.instagram && (
                <a href={`https://instagram.com/${seller.instagram}`} target="_blank" rel="noopener noreferrer" className="btn btn-icon btn-secondary btn-sm">
                  <FaInstagram size={14} />
                </a>
              )}
              {seller.github && (
                <a href={`https://github.com/${seller.github}`} target="_blank" rel="noopener noreferrer" className="btn btn-icon btn-secondary btn-sm">
                  <FaGithub size={14} />
                </a>
              )}
              {seller.linkedin && (
                <a href={`https://linkedin.com/in/${seller.linkedin}`} target="_blank" rel="noopener noreferrer" className="btn btn-icon btn-secondary btn-sm">
                  <FaLinkedin size={14} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Seller's Products Section */}
        <section className="section animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="section-title">
            Products by {seller.name} ({products.length})
          </h2>

          {products.length > 0 ? (
            <div className="product-grid" style={{ marginTop: 'var(--space-6)' }}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No products yet"
              description="This seller hasn't published any products to the marketplace."
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default SellerProfile;
