import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { ArrowRight } from 'lucide-react';
import Aurora from '../components/Aurora';
import '../styles/Home.css';

const CATEGORIES = ['Education', 'Programming', 'Design', 'AI', 'Business', 'Media', '3D & Game Assets', 'Productivity', 'Others'];

const Home = () => {
  const { isSeller } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const featuredRes = await API.get('/products?sort=best-selling');
        setFeaturedProducts(featuredRes.data.products?.slice(0, 3) || []);
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-aurora">
          <Aurora
            colorStops={["#0b2b11", "#abd0b2", "#1d941a"]}
            blend={1.0}
            amplitude={1.0}
            speed={0.7}
          />
        </div>
        <div className="container hero-content animate-fade-in-up">
          <h1 className="hero-title">
            The Marketplace for <br />
            <span className="hero-title-gradient">Digital Assets</span>
          </h1>
          <p className="hero-subtitle">
            Buy and sell digital assets.
          </p>
          <div className="hero-actions">
            <Link to="/marketplace" className="btn btn-primary btn-lg">
              Browse Marketplace
              <ArrowRight size={18} />
            </Link>
            {!isSeller && (
              <Link to="/seller/setup" className="btn btn-secondary btn-lg">
                Start Selling
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Top Products</h2>
              <p className="section-subtitle">We recommend you to check these out.</p>
            </div>
            <Link to="/marketplace?sort=best-selling" className="btn btn-ghost">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          {loading ? (
            <ProductGridSkeleton count={3} />
          ) : featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-8) 0' }}>
              No products yet. Be the first to sell!
            </p>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Browse Categories</h2>
              <p className="section-subtitle">Find exactly what you need</p>
            </div>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link
                to={`/marketplace?category=${encodeURIComponent(cat)}`}
                key={cat}
                className="category-card glass-card"
              >
                <span className="category-name">{cat}</span>
                <ArrowRight size={16} className="category-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
