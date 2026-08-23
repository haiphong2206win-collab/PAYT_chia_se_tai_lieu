import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import './Auth.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Visual Phase 1 navigation demo
    alert('Phase 1 Demonstration: Login credentials submitted visually. Redirecting to Profile...');
    navigate('/profile');
  };

  return (
    <div className="auth-form-content">
      <div className="auth-header">
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Log in to continue to PayT</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
          required
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
          required
          rightElement={
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <div className="auth-row-between">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="custom-checkbox"
            />
            <span>Remember me</span>
          </label>
          <a href="#forgot" className="forgot-link" onClick={(e) => e.preventDefault()}>
            Forgot password?
          </a>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth icon={LogIn}>
          Log In
        </Button>
      </form>

      <div className="auth-card-footer">
        <p>
          Don't have an account? <Link to="/register" className="auth-switch-link">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
