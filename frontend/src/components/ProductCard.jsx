import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import StarRating from './StarRating';
import UserAvatar from './UserAvatar';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const seller = product.seller_id;
  const slug = product.slug;

  return (
    <Link to={`/product/${slug}`} className="product-card glass-card" id={`product-${product._id}`}>
      <div className="product-card-image">
        {product.thumbnail_url ? (
          <img src={product.thumbnail_url} alt={product.title} loading="lazy" />
        ) : (
          <div className="product-card-placeholder">
            <Package size={40} />
          </div>
        )}
        <div className="product-card-category">
          <span className="badge">{product.category}</span>
        </div>
      </div>

      <div className="product-card-body">
        <h3 className="product-card-title">{product.title}</h3>

        {seller && (
          <div className="product-card-seller" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 'var(--space-2) 0' }}>
            <UserAvatar user={seller} className="product-card-seller-avatar" size={24} />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              {seller.name || seller.username}
            </span>
          </div>
        )}

        <div className="product-card-footer">
          <div className="product-card-rating">
            <StarRating rating={product.average_rating} count={product.rating_count} size={12} />
          </div>
          <p className="product-card-price">₹{product.price}</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
