import { Link } from 'react-router-dom';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { FiMail, FiGlobe } from 'react-icons/fi';
import logo from '../assets/logo.png';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-top-row">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src={logo} alt="FileMerch Logo" className="footer-logo-img" /> 
            </Link>
          </div>

          <div className="footer-socials">
            <a href="https://www.linkedin.com/in/tharun2007" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="LinkedIn">
              <FaLinkedin size={24} />
            </a>
            <a href="https://github.com/TharunR18" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="GitHub">
              <FaGithub size={24} />
            </a>
            <a href="mailto:its.tharun018@gmail.com" className="footer-social-btn" aria-label="Email">
              <FiMail size={24} />
            </a>
            <a href="https://tharunportfolio-r18.vercel.app" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Website">
              <FiGlobe size={24} />
            </a>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom-row">
          <div className="footer-big-brand">FILEMERCH</div>
          <p className="footer-copyright">&copy; {new Date().getFullYear()} FILEMERCH. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
