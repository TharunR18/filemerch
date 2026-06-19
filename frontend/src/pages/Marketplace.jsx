import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { Search, SlidersHorizontal, PackageSearch } from 'lucide-react';
import '../styles/Marketplace.css';

const CATEGORIES = ['All', 'Education', 'Programming', 'Design', 'AI', 'Business', 'Media', '3D & Game Assets', 'Productivity', 'Others'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'top-rated', label: 'Top Rated' },
];

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const activeCategory = searchParams.get('category') || 'All';
  const activeSort = searchParams.get('sort') || 'newest';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (activeCategory !== 'All') params.set('category', activeCategory);
        params.set('sort', activeSort);

        const res = await API.get(`/products?${params.toString()}`);
        setProducts(res.data.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery, activeCategory, activeSort]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="marketplace-header animate-fade-in">
          <h1 className="page-title">Marketplace</h1>
          <p className="section-subtitle">Discover premium digital products</p>
        </div>

        {/* Search Bar */}
        <form className="marketplace-search" onSubmit={handleSearch}>
          <Search size={18} className="marketplace-search-icon" />
          <input
            type="text"
            className="marketplace-search-input"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        {/* Filters */}
        <div className="marketplace-filters">
          <div className="marketplace-categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`marketplace-cat-btn ${activeCategory === cat ? 'marketplace-cat-btn--active' : ''}`}
                onClick={() => updateParam('category', cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="marketplace-sort">
            <SlidersHorizontal size={16} />
            <select
              className="form-input form-select marketplace-sort-select"
              value={activeSort}
              onChange={(e) => updateParam('sort', e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length > 0 ? (
          <>
            <p className="marketplace-count">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="No products found"
            description="Try adjusting your search or filters."
          />
        )}
      </div>
    </div>
  );
};

export default Marketplace;
