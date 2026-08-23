import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import './Auth.css';

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Phase 1 Demonstration: Account creation request received visually. Redirecting to Login...');
    navigate('/login');
  };

  return (
    <div className="auth-form-content">
      <div className="auth-header">
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Join PayT and start sharing knowledge</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <Input
          label="Full Name"
          type="text"
          placeholder="Alex Rivera"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          icon={User}
          required
        />

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
          placeholder="Create a password"
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

        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={Lock}
          required
        />

        <div className="auth-terms-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="custom-checkbox"
              required
            />
            <span>I agree to the <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a> and <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a></span>
          </label>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth icon={UserPlus}>
          Create Account
        </Button>
      </form>

      <div className="auth-card-footer">
        <p>
          Already have an account? <Link to="/login" className="auth-switch-link">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
