import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Store, User, CreditCard, Link2, FileText, Settings, AlertTriangle } from 'lucide-react';

const SellerSetup = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    upi_id: '',
    upi_name: '',
    bio: '',
    website: '',
    twitter: '',
    instagram: '',
    github: '',
    linkedin: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        upi_id: user.upi_id || '',
        upi_name: user.upi_name || '',
        bio: user.bio || '',
        website: user.website || '',
        twitter: user.twitter || '',
        instagram: user.instagram || '',
        github: user.github || '',
        linkedin: user.linkedin || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      // Force lowercase and strip invalid characters
      const cleanVal = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanVal }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || formData.username.length < 3) {
      return toast.error('Username must be at least 3 characters long');
    }
    if (!formData.upi_id) {
      return toast.error('UPI ID is required');
    }
    if (!formData.upi_name) {
      return toast.error('Account holder name is required');
    }

    setSubmitting(true);
    try {
      if (user?.is_seller) {
        await API.put('/seller/update', {
          upi_id: formData.upi_id,
          upi_name: formData.upi_name,
          bio: formData.bio,
          website: formData.website,
          twitter: formData.twitter,
          instagram: formData.instagram,
          github: formData.github,
          linkedin: formData.linkedin
        });
        toast.success('Store profile updated successfully!');
      } else {
        await API.post('/seller/setup', formData);
        toast.success('Congratulations! You are now a seller.');
      }
      // Refresh user context
      await refreshUser(); 
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete store setup');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="container animate-fade-in-up">
        <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <div className="avatar avatar-md" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
              {user?.is_seller ? <Settings size={24} /> : <Store size={24} />}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>
                {user?.is_seller ? 'Store Settings' : 'Become a Seller'}
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
                {user?.is_seller ? 'Update your storefront details and payment links.' : 'Set up your storefront and start selling digital files.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Username */}
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                <User size={14} /> Store Username
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 'var(--space-4)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                  filemerch.com/seller/
                </span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-input"
                  style={{ paddingLeft: '9.5rem' }}
                  placeholder="yourstore"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={user?.is_seller}
                />
              </div>
              <p className="form-help">
                {user?.is_seller 
                  ? 'Store username cannot be changed.' 
                  : 'Unique store identifier. Lowercase letters, numbers, hyphens, and underscores only. Cannot be changed later.'}
              </p>
            </div>

            {/* UPI Info */}
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', color: 'var(--color-warning)', display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', fontSize: 'var(--font-size-sm)' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span style={{ fontWeight: 700, display: 'block', marginBottom: '2px' }}>Demo Mode Notice</span>
                UPI ID and Account Name are for sample/simulation purposes only. No real money transactions are going to happen on this platform.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="upi_id">
                  <CreditCard size={14} /> UPI ID
                </label>
                <input
                  type="text"
                  id="upi_id"
                  name="upi_id"
                  className="form-input"
                  placeholder="username@bank"
                  value={formData.upi_id}
                  onChange={handleChange}
                  required
                />
                <p className="form-help">Where you'll receive payments.</p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="upi_name">
                  Account Name
                </label>
                <input
                  type="text"
                  id="upi_name"
                  name="upi_name"
                  className="form-input"
                  placeholder="Full Name"
                  value={formData.upi_name}
                  onChange={handleChange}
                  required
                />
                <p className="form-help">Name registered with the UPI ID.</p>
              </div>
            </div>

            {/* Bio */}
            <div className="form-group">
              <label className="form-label" htmlFor="bio">
                <FileText size={14} /> Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                className="form-input form-textarea"
                placeholder="Tell buyers about your digital assets..."
                value={formData.bio}
                onChange={handleChange}
                maxLength={500}
              />
            </div>

            {/* Website & Socials */}
            <div className="form-group">
              <label className="form-label" htmlFor="website">
                <Link2 size={14} /> Website URL
              </label>
              <input
                type="url"
                id="website"
                name="website"
                className="form-input"
                placeholder="https://example.com"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="twitter">Twitter</label>
                <input
                  type="text"
                  id="twitter"
                  name="twitter"
                  className="form-input"
                  placeholder="username"
                  value={formData.twitter}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="instagram">Instagram</label>
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  className="form-input"
                  placeholder="username"
                  value={formData.instagram}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="github">GitHub</label>
                <input
                  type="text"
                  id="github"
                  name="github"
                  className="form-input"
                  placeholder="username"
                  value={formData.github}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="linkedin">LinkedIn</label>
                <input
                  type="text"
                  id="linkedin"
                  name="linkedin"
                  className="form-input"
                  placeholder="username"
                  value={formData.linkedin}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 'var(--space-2)' }} disabled={submitting}>
              {submitting 
                ? (user?.is_seller ? 'Saving changes...' : 'Setting up Store...') 
                : (user?.is_seller ? 'Save Changes' : 'Launch Store')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerSetup;
