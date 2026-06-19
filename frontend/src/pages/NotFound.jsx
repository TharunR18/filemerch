import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import '../styles/NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-page">
      <div className="notfound-content animate-fade-in-up">
        <FileQuestion size={80} className="notfound-icon" />
        <h1 className="notfound-title">404</h1>
        <p className="notfound-subtitle">Page not found</p>
        <p className="notfound-description">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary btn-lg">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
