import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import '../styles/NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-glitch-wrapper">
          <h1 className="notfound-code">404</h1>
          <div className="notfound-bg-text">LOST</div>
        </div>

        <h2 className="notfound-title">Page not found</h2>
        <p className="notfound-description">
          The page you are looking for doesn't exist or has been moved to another URL.
        </p>

        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary">
            <Home size={18} />
            Back to Home
          </Link>
          <button onClick={() => window.history.back()} className="btn btn-secondary">
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
