import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, CheckCircle2 } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import './Auth.css';

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateFullName = (val) => {
    if (!val || !val.trim()) {
      return 'Full name is required';
    }
    return '';
  };

  const validateEmail = (val) => {
    if (!val || !val.trim()) {
      return 'Email address is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (val) => {
    if (!val) {
      return 'Password is required';
    }
    if (val.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return '';
  };

  const validateConfirmPassword = (val, mainPassword) => {
    if (!val) {
      return 'Please confirm your password';
    }
    if (val !== mainPassword) {
      return 'Passwords do not match';
    }
    return '';
  };

  const validateTerms = (checked) => {
    if (!checked) {
      return 'You must accept the Terms of Service and Privacy Policy';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};

    const nameErr = validateFullName(fullName);
    if (nameErr) newErrors.fullName = nameErr;

    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;

    const passwordErr = validatePassword(password);
    if (passwordErr) newErrors.password = passwordErr;

    const confirmErr = validateConfirmPassword(confirmPassword, password);
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    const termsErr = validateTerms(acceptTerms);
    if (termsErr) newErrors.acceptTerms = termsErr;

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      setSuccessMessage('Account created successfully! (Frontend mock demonstration)');
    }
  };

  const handleFullNameChange = (e) => {
    const val = e.target.value;
    setFullName(val);
    if (errors.fullName) {
      setErrors((prev) => ({
        ...prev,
        fullName: validateFullName(val)
      }));
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (errors.email) {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(val)
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (errors.password) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(val)
      }));
    }
    if (errors.confirmPassword && confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(confirmPassword, val)
      }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (errors.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(val, password)
      }));
    }
  };

  const handleTermsChange = (e) => {
    const checked = e.target.checked;
    setAcceptTerms(checked);
    if (errors.acceptTerms) {
      setErrors((prev) => ({
        ...prev,
        acceptTerms: validateTerms(checked)
      }));
    }
  };

  return (
    <div className="auth-form-content">
      <div className="auth-header">
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Join PayT and start sharing knowledge</p>
      </div>

      {successMessage && (
        <div className="auth-success-alert">
          <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} className="auth-form">
        <Input
          label="Full Name"
          type="text"
          placeholder="Alex Rivera"
          value={fullName}
          onChange={handleFullNameChange}
          icon={User}
          error={errors.fullName}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="name@university.edu"
          value={email}
          onChange={handleEmailChange}
          icon={Mail}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a password"
          value={password}
          onChange={handlePasswordChange}
          icon={Lock}
          error={errors.password}
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
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          icon={Lock}
          error={errors.confirmPassword}
          required
          rightElement={
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <div className="auth-terms-wrapper">
          <div className="auth-terms-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={handleTermsChange}
                className="custom-checkbox"
              />
              <span>I agree to the <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a> and <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a></span>
            </label>
          </div>
          {errors.acceptTerms && <p className="auth-terms-error">{errors.acceptTerms}</p>}
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

