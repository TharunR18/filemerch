import '../styles/LoadingSkeleton.css';

export const ProductCardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-card-image" />
    <div className="skeleton-card-body">
      <div className="skeleton skeleton-text skeleton-text--title" />
      <div className="skeleton skeleton-text skeleton-text--sm" />
      <div className="skeleton-card-footer">
        <div className="skeleton skeleton-text skeleton-text--xs" />
        <div className="skeleton skeleton-text skeleton-text--price" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="product-grid">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const PageSkeleton = () => (
  <div className="skeleton-page">
    <div className="skeleton skeleton-text skeleton-text--heading" />
    <div className="skeleton skeleton-text skeleton-text--paragraph" />
    <div className="skeleton skeleton-text skeleton-text--paragraph" />
  </div>
);
