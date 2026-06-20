import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Tag, Save, ArrowLeft, Image, Upload } from 'lucide-react';

const CATEGORIES = [
  'Education',
  'Programming',
  'Design',
  'AI',
  'Business',
  'Media',
  '3D & Game Assets',
  'Productivity',
  'Others'
];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 10,
    category: 'Education',
    tagsString: ''
  });
  const [currentThumbnail, setCurrentThumbnail] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [productFile, setProductFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        const product = res.data.product;
        setFormData({
          title: product.title || '',
          description: product.description || '',
          price: product.price || 10,
          category: product.category || 'Education',
          tagsString: product.tags?.join(', ') || ''
        });
        setCurrentThumbnail(product.thumbnail_url || '');
      } catch (err) {
        toast.error('Failed to load product details');
        navigate('/dashboard/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setThumbnailFile(file);
    }
  };

  const handleProductFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Product file size must be less than 50MB');
        return;
      }

      const allowedExtensions = [
        'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt',
        'zip', 'rar', '7z', 'png', 'jpg', 'jpeg', 'webp'
      ];
      const blockedExtensions = [
        'apk', 'exe', 'bat', 'cmd', 'scr', 'msi', 'ps1', 'jar', 'sh', 'com'
      ];

      const ext = file.name.split('.').pop()?.toLowerCase();

      if (blockedExtensions.includes(ext)) {
        toast.error(`File type .${ext} is blocked for security reasons.`);
        e.target.value = ''; // Reset input
        return;
      }

      if (!allowedExtensions.includes(ext)) {
        toast.error(`File type .${ext} is not allowed.`);
        e.target.value = ''; // Reset input
        return;
      }

      setProductFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Title is required');
    if (!formData.description.trim()) return toast.error('Description is required');
    if (formData.price < 10) return toast.error('Price must be at least 10 INR');

    setSubmitting(true);
    try {
      const tags = formData.tagsString
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // 1. Update metadata
      await API.patch(`/products/${id}`, {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        tags
      });

      // 2. Upload new cover image if selected
      if (thumbnailFile) {
        const imageFormData = new FormData();
        imageFormData.append('thumbnail', thumbnailFile);

        await API.post(`/products/${id}/upload-thumbnail`, imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // 3. Upload new product file if selected
      if (productFile) {
        const fileFormData = new FormData();
        fileFormData.append('file', productFile);

        await API.post(`/products/${id}/upload`, fileFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      toast.success('Product updated successfully');
      navigate('/dashboard/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
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
    <div className="page" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="container animate-fade-in-up">
        {/* Back Link */}
        <Link to="/dashboard/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)' }} className="hover-white">
          <ArrowLeft size={16} /> Back to Products
        </Link>

        <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--space-6)' }}>
            Edit Product Details
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="title">Product Title</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-input"
                placeholder="e.g. Premium React Dashboard Template"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category & Price */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  className="form-input"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="price">Price (INR)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className="form-input"
                  min="10"
                  placeholder="10"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
                <p className="form-help">Minimum price is ₹10.</p>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-input form-textarea"
                placeholder="Explain what buyers will get, features, instructions..."
                value={formData.description}
                onChange={handleChange}
                required
                maxLength={2000}
              />
            </div>

            {/* Current Cover Preview */}
            {currentThumbnail && !thumbnailFile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>Current Cover Image:</p>
                <img src={currentThumbnail} alt="Current Cover" style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-surface-border)' }} />
              </div>
            )}

            {/* Thumbnail Image upload from device */}
            <div className="form-group">
              <label className="form-label">
                <Image size={14} /> Update Cover Image (Optional)
              </label>
              <div style={{
                border: '2px dashed var(--color-surface-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-6) var(--space-4)',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
                background: 'var(--color-bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }} className="hover-border-primary">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%'
                  }}
                  onChange={handleThumbnailChange}
                />
                {thumbnailFile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <img 
                      src={URL.createObjectURL(thumbnailFile)} 
                      alt="Preview" 
                      style={{ width: '160px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-surface-border)' }} 
                    />
                    <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{thumbnailFile.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload size={24} style={{ color: 'var(--color-text-muted)' }} />
                    <div>
                      <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Select Cover Image to Replace</p>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        PNG, JPG, WebP (Max 5MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Product File Upload */}
            <div className="form-group">
              <label className="form-label">
                <Upload size={14} style={{ marginRight: '6px' }} /> Update Product File (Optional)
              </label>
              <div style={{
                border: '2px dashed var(--color-surface-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-6) var(--space-4)',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
                background: 'var(--color-bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }} className="hover-border-primary">
                <input
                  type="file"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%'
                  }}
                  onChange={handleProductFileChange}
                />
                {productFile ? (
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{productFile.name}</p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      Size: {(productFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload size={24} style={{ color: 'var(--color-text-muted)' }} />
                    <div>
                      <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Select Product File to Replace</p>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        ZIP, PDF, DOCX, etc. (Max 50MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label" htmlFor="tagsString">
                <Tag size={14} /> Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tagsString"
                name="tagsString"
                className="form-input"
                placeholder="react, dashboard, tailwind, template"
                value={formData.tagsString}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 'var(--space-2)' }} disabled={submitting}>
              <Save size={18} />
              {submitting ? 'Saving changes & Uploading...' : 'Save Product Details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
