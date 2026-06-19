import { Star } from 'lucide-react';
import '../styles/StarRating.css';

const StarRating = ({ rating = 0, count, size = 14, interactive = false, onChange }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.round(rating);
    stars.push(
      <button
        key={i}
        type="button"
        className={`star-btn ${filled ? 'star-btn--filled' : ''} ${interactive ? 'star-btn--interactive' : ''}`}
        onClick={() => interactive && onChange?.(i)}
        disabled={!interactive}
        aria-label={`${i} star`}
      >
        <Star size={size} fill={filled ? 'var(--color-star)' : 'none'} />
      </button>
    );
  }

  return (
    <div className="star-rating">
      <div className="star-rating-stars">{stars}</div>
      {count !== undefined && (
        <span className="star-rating-count">({count})</span>
      )}
    </div>
  );
};

export default StarRating;
