import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Upload, ArrowLeft, File, CheckCircle, AlertTriangle } from 'lucide-react';

const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt',
  'zip', 'rar', '7z', 'png', 'jpg', 'jpeg', 'webp'
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const UploadProductFile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch (err) {
        toast.error('Failed to load product');
        navigate('/dashboard/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate size
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds the 50 MB limit.');
      return;
    }

    // Validate extension
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error('This file type is not allowed.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file to upload');

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await API.post(`/products/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Product file uploaded successfully!');
      navigate('/dashboard/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
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
    <div className="page" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="container animate-fade-in-up">
        {/* Back Link */}
        <Link to="/dashboard/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)' }} className="hover-white">
          <ArrowLeft size={16} /> Back to Products
        </Link>

        <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            Upload Product File
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
            Product: <strong style={{ color: 'var(--color-text-primary)' }}>{product?.title}</strong>
          </p>

          {product?.file_key && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0 }} />
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                An active file is already uploaded. Uploading a new file will replace the current file.
              </p>
            </div>
          )}

          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div style={{
              border: '2px dashed var(--color-surface-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8) var(--space-4)',
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              background: 'var(--color-bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-3)'
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
                onChange={handleFileChange}
              />
              <Upload size={32} style={{ color: 'var(--color-text-muted)' }} />
              <div>
                <p style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>
                  {file ? file.name : 'Choose a file or drag & drop'}
                </p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  {file ? `Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Max 50 MB'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>Allowed formats:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {ALLOWED_EXTENSIONS.map(ext => (
                  <span key={ext} style={{ fontSize: 'var(--font-size-2xs)', background: 'var(--color-surface-hover)', border: '1px solid var(--color-surface-border)', padding: '2px 8px', borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)' }}>
                    {ext.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ gap: 'var(--space-2)' }} disabled={uploading || !file}>
              <Upload size={18} />
              {uploading ? 'Uploading File...' : 'Upload File'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadProductFile;
