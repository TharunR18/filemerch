import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import logo from '../assets/logo.png';
import authVideo from '../assets/auth_page-video.mp4';
import toast from 'react-hot-toast';
import '../styles/Login.css';


const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (searchParams.get('error')) {
      toast.error('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  return (
    <div className="login-page">
      <div className="login-card glass-card animate-fade-in-up">
        <div className="login-logo">
          <img src={logo} alt="FileMerch Logo" className="login-logo-img" />
        </div>
        <p className="login-subtitle">Sign in to access the digital marketplace</p>

        <div className="login-video-container">
          <video
            src={authVideo}
            autoPlay
            loop
            muted
            playsInline
            className="login-video"
          />
        </div>

        <hr className="login-divider" />

        <button className="login-google-btn" onClick={login}>
          <FcGoogle size={22} />
          <span>Continue with Google</span>
        </button>

        <hr className="login-divider" />

        <p className="login-terms">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>

      </div>
    </div>
  );
};

export default Login;
