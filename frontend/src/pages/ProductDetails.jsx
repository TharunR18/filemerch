import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import UserAvatar from '../components/UserAvatar';
import { Package, Download, Tag, User, ExternalLink, ShoppingBag, CheckCircle, Trash2, Edit3, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/ProductDetails.css';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [owned, setOwned] = useState(false);
  const [buying, setBuying] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Review state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/products/${slug}`);
        setProduct(res.data.product);

        // Fetch related products
        if (res.data.product?._id) {
          const relatedRes = await API.get(`/products/${res.data.product._id}/related`);
          setRelatedProducts(relatedRes.data.products || []);

          // Fetch reviews
          const reviewsRes = await API.get(`/reviews/product/${res.data.product._id}`);
          setReviews(reviewsRes.data.reviews || []);
        }
      } catch {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  // Check ownership
  useEffect(() => {
    if (!isAuthenticated || !product) return;
    const checkOwnership = async () => {
      try {
        const res = await API.get('/purchases/my-purchases');
        const purchases = res.data.purchases || [];
        setOwned(purchases.some(p => p.product_id?._id === product._id));
      } catch {
        /* ignore */
      }
    };
    checkOwnership();
  }, [isAuthenticated, product]);

  const handleBuy = async () => {
    if (!isAuthenticated) return navigate('/login');
    setPaymentModalOpen(true);
  };

  const confirmPurchase = async () => {
    setBuying(true);
    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        toast.error('Failed to load Razorpay SDK. Please check your internet connection.');
        setBuying(false);
        return;
      }

      // 1. Create order on backend
      const res = await API.post(`/purchases/buy/${product._id}`);
      const { key_id, amount, razorpayOrderId, currency } = res.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'FileMerch',
        description: product.title,
        order_id: razorpayOrderId,
        handler: async function (response) {
          setBuying(true);
          try {
            // Verify payment on backend
            const verifyRes = await API.post('/purchases/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success('Purchase successful!');
              setOwned(true);
              setPaymentModalOpen(false);
              setProduct(prev => ({ ...prev, total_sales: (prev.total_sales || 0) + 1 }));
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setBuying(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function () {
            setBuying(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate purchase');
      setBuying(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await API.get(`/purchases/download/${product._id}`);
      window.open(res.data.downloadUrl, '_blank');
      toast.success('Download started!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewRating === 0) return toast.error('Please select a rating');
    setSubmittingReview(true);
    try {
      if (editingReview) {
        await API.put(`/reviews/${editingReview._id}`, { rating: reviewRating, comment: reviewComment });
        toast.success('Review updated');
      } else {
        await API.post('/reviews', { product_id: product._id, rating: reviewRating, comment: reviewComment });
        toast.success('Review posted');
      }
      // Refresh reviews
      const reviewsRes = await API.get(`/reviews/product/${product._id}`);
      setReviews(reviewsRes.data.reviews || []);
      // Refresh product for updated rating
      const prodRes = await API.get(`/products/${slug}`);
      setProduct(prodRes.data.product);
      setReviewRating(0);
      setReviewComment('');
      setEditingReview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      await API.delete(`/reviews/${id}`);
      toast.success('Review deleted');
      setReviews(reviews.filter(r => r._id !== id));
      const prodRes = await API.get(`/products/${slug}`);
      setProduct(prodRes.data.product);
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const startEditReview = (review) => {
    setEditingReview(review);
    setReviewRating(review.rating);
    setReviewComment(review.comment || '');
  };

  const isOwnProduct = user && product && product.seller_id?._id === user._id;
  const userReview = reviews.find(r => r.buyer_id?._id === user?._id);
  const canReview = owned && !userReview && !isOwnProduct;

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-20) 0' }}>
          <div className="spinner spinner-lg" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState icon={Package} title="Product not found" description="This product doesn't exist or has been removed." action={<Link to="/marketplace" className="btn btn-primary">Browse Marketplace</Link>} />
        </div>
      </div>
    );
  }

  const seller = product.seller_id;

  return (
    <div className="page">
      <div className="container">
        <div className="pd-layout animate-fade-in">
          {/* Main Content */}
          <div className="pd-main">
            {/* Thumbnail */}
            <div className="pd-thumbnail glass-card">
              {product.thumbnail_url ? (
                <img src={product.thumbnail_url} alt={product.title} />
              ) : (
                <div className="pd-thumbnail-placeholder">
                  <Package size={64} />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="pd-section">
              <h2 className="pd-section-title">Description</h2>
              <p className="pd-description">{product.description}</p>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="pd-section">
                <h2 className="pd-section-title">Tags</h2>
                <div className="pd-tags">
                  {product.tags.map((tag, i) => (
                    <span key={i} className="pd-tag">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="pd-section">
              <h2 className="pd-section-title">
                <MessageSquare size={20} />
                Reviews ({reviews.length})
              </h2>

              {/* Review Form */}
              {(canReview || editingReview) && (
                <form className="pd-review-form glass-card" onSubmit={handleSubmitReview}>
                  <p className="pd-review-form-label">{editingReview ? 'Edit your review' : 'Write a review'}</p>
                  <StarRating rating={reviewRating} interactive onChange={setReviewRating} size={24} />
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Share your experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    maxLength={1000}
                  />
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : editingReview ? 'Update Review' : 'Post Review'}
                    </button>
                    {editingReview && (
                      <button type="button" className="btn btn-ghost" onClick={() => { setEditingReview(null); setReviewRating(0); setReviewComment(''); }}>Cancel</button>
                    )}
                  </div>
                </form>
              )}

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="pd-reviews-list">
                  {reviews.map((review) => (
                    <div key={review._id} className="pd-review-item glass-card">
                      <div className="pd-review-header">
                        <div className="pd-review-user">
                          <UserAvatar user={review.buyer_id} className="pd-review-avatar" size={40} />
                          <div>
                            <p className="pd-review-name">{review.buyer_id?.name || 'User'}</p>
                            <StarRating rating={review.rating} size={12} />
                          </div>
                        </div>
                        {user && review.buyer_id?._id === user._id && (
                          <div className="pd-review-actions">
                            <button className="btn btn-icon btn-ghost" onClick={() => startEditReview(review)}>
                              <Edit3 size={14} />
                            </button>
                            <button className="btn btn-icon btn-ghost" onClick={() => setDeleteConfirm(review._id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      {review.comment && <p className="pd-review-comment">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-4)' }}>
                  No reviews yet.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="pd-sidebar">
            <div className="pd-info glass-card">
              <h1 className="pd-title">{product.title}</h1>
              <div className="pd-meta">
                <span className="badge">{product.category}</span>
                <StarRating rating={product.average_rating} count={product.rating_count} />
              </div>
              <p className="pd-price">₹{product.price}</p>

              {/* Buy / Download / Own Product */}
              {isOwnProduct ? (
                <p className="pd-own-label">This is your product</p>
              ) : owned ? (
                <button className="btn btn-primary btn-lg pd-buy-btn" onClick={handleDownload}>
                  <Download size={18} />
                  Download
                </button>
              ) : (
                <button className="btn btn-primary btn-lg pd-buy-btn" onClick={handleBuy}>
                  <ShoppingBag size={18} />
                  Buy Now — ₹{product.price}
                </button>
              )}

              {owned && (
                <div className="pd-owned-badge">
                  <CheckCircle size={14} />
                  <span>Purchased</span>
                </div>
              )}

              {/* Stats */}
              <div className="pd-stats">
                <div className="pd-stat">
                  <span className="pd-stat-value">{product.total_sales || 0}</span>
                  <span className="pd-stat-label">Sales</span>
                </div>
                {product.file_type && (
                  <div className="pd-stat">
                    <span className="pd-stat-value">{product.file_type.split('/').pop()?.toUpperCase()}</span>
                    <span className="pd-stat-label">File Type</span>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Card */}
            {seller && (
              <div className="pd-seller glass-card">
                <div className="pd-seller-header">
                  <UserAvatar user={seller} className="pd-seller-avatar" size={48} />
                  <div>
                    <p className="pd-seller-name">{seller.name}</p>
                    {seller.username && <p className="pd-seller-username">@{seller.username}</p>}
                  </div>
                </div>
                {seller.bio && <p className="pd-seller-bio">{seller.bio}</p>}
                <div className="pd-seller-links">
                  {seller.website && <a href={seller.website} target="_blank" rel="noopener noreferrer" className="pd-seller-link"><ExternalLink size={14} /> Website</a>}
                </div>
                {seller.username && (
                  <Link to={`/seller/${seller.username}`} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 'var(--space-3)' }}>
                    <User size={14} /> View Profile
                  </Link>
                )}
              </div>
            )}
          </aside>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="section">
            <h2 className="section-title">Related Products</h2>
            <div className="product-grid" style={{ marginTop: 'var(--space-6)' }}>
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="confirm-backdrop" onClick={() => setPaymentModalOpen(false)}>
          <div className="pd-payment-modal glass-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Purchase</h3>
            <div className="pd-payment-product">
              <Package size={20} />
              <span>{product.title}</span>
            </div>
            <p className="pd-payment-price">₹{product.price}</p>
            <p className="pd-payment-note">Demo Mode — No real payment required</p>
            <div className="pd-payment-actions">
              <button className="btn btn-secondary" onClick={() => setPaymentModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmPurchase} disabled={buying}>
                {buying ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        danger
        onConfirm={() => handleDeleteReview(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};

export default ProductDetails;
