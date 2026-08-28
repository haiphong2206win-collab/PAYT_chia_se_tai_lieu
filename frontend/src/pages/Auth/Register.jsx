import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

import { registerApi } from '../../services/auth.api';

import './Auth.css';

export const Register = () => {
  // 1. FORM STATE

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [acceptTerms, setAcceptTerms] = useState(false);

  // Lỗi validation FE + lỗi API Backend
  const [errors, setErrors] = useState({});

  // Thông báo thành công
  const [successMessage, setSuccessMessage] =
    useState('');

  // Trạng thái đang gửi request
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // 2. VALIDATION FULL NAME

  const validateFullName = (val) => {
    if (!val || !val.trim()) {
      return 'Full name is required';
    }

    return '';
  };

  // 3. VALIDATION EMAIL

  const validateEmail = (val) => {
    if (!val || !val.trim()) {
      return 'Email address is required';
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(val.trim())) {
      return 'Please enter a valid email address';
    }

    return '';
  };

  // 4. VALIDATION PASSWORD

  const validatePassword = (val) => {
    if (!val) {
      return 'Password is required';
    }

    if (val.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    return '';
  };

  // 5. VALIDATION CONFIRM PASSWORD

  const validateConfirmPassword = (
    val,
    mainPassword
  ) => {
    if (!val) {
      return 'Please confirm your password';
    }

    if (val !== mainPassword) {
      return 'Passwords do not match';
    }

    return '';
  };

  // 6. VALIDATION TERMS

  const validateTerms = (checked) => {
    if (!checked) {
      return 'You must accept the Terms of Service and Privacy Policy';
    }

    return '';
  };

  // 7. VALIDATE TOÀN FORM

  const validateForm = () => {
    const newErrors = {};

    const nameErr =
      validateFullName(fullName);

    if (nameErr) {
      newErrors.fullName = nameErr;
    }

    const emailErr =
      validateEmail(email);

    if (emailErr) {
      newErrors.email = emailErr;
    }

    const passwordErr =
      validatePassword(password);

    if (passwordErr) {
      newErrors.password = passwordErr;
    }

    const confirmErr =
      validateConfirmPassword(
        confirmPassword,
        password
      );

    if (confirmErr) {
      newErrors.confirmPassword =
        confirmErr;
    }

    const termsErr =
      validateTerms(acceptTerms);

    if (termsErr) {
      newErrors.acceptTerms =
        termsErr;
    }

    return newErrors;
  };

  // 8. SUBMIT REGISTER -> BACKEND THẬT

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tránh bấm Create Account nhiều lần
    if (isSubmitting) {
      return;
    }

    // Xóa message cũ
    setSuccessMessage('');

    // Xóa lỗi API cũ
    setErrors((prev) => ({
      ...prev,
      api: '',
    }));

    // Kiểm tra dữ liệu phía FE trước
    const validationErrors =
      validateForm();

    if (
      Object.keys(validationErrors)
        .length > 0
    ) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // Đây là dữ liệu Backend cần
      const userData = {
        fullName: fullName.trim(),
        email: email.trim(),
        password: password,
      };


      // Gọi POST /auth/register
      const response =
        await registerApi(userData);

      // Hiện message BE trả về
      setSuccessMessage(
        response.message ||
        'Account created successfully!'
      );

      // Có thể reset form sau khi đăng ký thành công
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAcceptTerms(false);
    } catch (error) {
      console.error(
        'Register API error:',
        error
      );

      // Nếu BE có trả message lỗi
      const apiMessage =
        error.response?.data?.message ||
        'Registration failed. Please try again.';

      setErrors((prev) => ({
        ...prev,
        api: apiMessage,
      }));
    } finally {
      // Thành công hay lỗi đều phải mở lại nút
      setIsSubmitting(false);
    }
  };

  // 9. INPUT CHANGE HANDLERS

  const handleFullNameChange = (e) => {
    const val = e.target.value;

    setFullName(val);
    setSuccessMessage('');

    if (errors.api) {
      setErrors((prev) => ({
        ...prev,
        api: '',
      }));
    }

    if (errors.fullName) {
      setErrors((prev) => ({
        ...prev,
        fullName:
          validateFullName(val),
      }));
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;

    setEmail(val);
    setSuccessMessage('');

    if (errors.api) {
      setErrors((prev) => ({
        ...prev,
        api: '',
      }));
    }

    if (errors.email) {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(val),
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;

    setPassword(val);
    setSuccessMessage('');

    if (errors.api) {
      setErrors((prev) => ({
        ...prev,
        api: '',
      }));
    }

    if (errors.password) {
      setErrors((prev) => ({
        ...prev,
        password:
          validatePassword(val),
      }));
    }

    // Nếu confirm password đã nhập,
    // kiểm tra lại khi password đổi
    if (
      errors.confirmPassword &&
      confirmPassword
    ) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          validateConfirmPassword(
            confirmPassword,
            val
          ),
      }));
    }
  };

  const handleConfirmPasswordChange = (
    e
  ) => {
    const val = e.target.value;

    setConfirmPassword(val);
    setSuccessMessage('');

    if (errors.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          validateConfirmPassword(
            val,
            password
          ),
      }));
    }
  };

  const handleTermsChange = (e) => {
    const checked =
      e.target.checked;

    setAcceptTerms(checked);

    if (errors.acceptTerms) {
      setErrors((prev) => ({
        ...prev,
        acceptTerms:
          validateTerms(checked),
      }));
    }
  };

  // 10. UI

  return (
    <div className="auth-form-content">
      <div className="auth-header">
        <h2 className="auth-title">
          Create your account
        </h2>

        <p className="auth-subtitle">
          Join PayT and start sharing
          knowledge
        </p>
      </div>

      {/* SUCCESS FROM BACKEND */}
      {successMessage && (
        <div className="auth-success-alert">
          <CheckCircle2
            size={20}
            style={{
              flexShrink: 0,
            }}
          />

          <span>
            {successMessage}
          </span>
        </div>
      )}

      {/* ERROR FROM BACKEND */}
      {errors.api && (
        <p className="auth-terms-error">
          {errors.api}
        </p>
      )}

      <form
        noValidate
        onSubmit={handleSubmit}
        className="auth-form"
      >
        {/* FULL NAME */}
        <Input
          label="Full Name"
          type="text"
          placeholder="Alex Rivera"
          value={fullName}
          onChange={
            handleFullNameChange
          }
          icon={User}
          error={errors.fullName}
          required
        />

        {/* EMAIL */}
        <Input
          label="Email Address"
          type="email"
          placeholder="name@university.edu"
          value={email}
          onChange={
            handleEmailChange
          }
          icon={Mail}
          error={errors.email}
          required
        />

        {/* PASSWORD */}
        <Input
          label="Password"
          type={
            showPassword
              ? 'text'
              : 'password'
          }
          placeholder="Create a password"
          value={password}
          onChange={
            handlePasswordChange
          }
          icon={Lock}
          error={errors.password}
          required
          rightElement={
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              aria-label={
                showPassword
                  ? 'Hide password'
                  : 'Show password'
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          }
        />

        {/* CONFIRM PASSWORD */}
        <Input
          label="Confirm Password"
          type={
            showConfirmPassword
              ? 'text'
              : 'password'
          }
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={
            handleConfirmPasswordChange
          }
          icon={Lock}
          error={
            errors.confirmPassword
          }
          required
          rightElement={
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              aria-label={
                showConfirmPassword
                  ? 'Hide confirm password'
                  : 'Show confirm password'
              }
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          }
        />

        {/* TERMS */}
        <div className="auth-terms-wrapper">
          <div className="auth-terms-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={
                  handleTermsChange
                }
                className="custom-checkbox"
              />

              <span>
                I agree to the{' '}
                <a
                  href="#terms"
                  onClick={(e) =>
                    e.preventDefault()
                  }
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="#privacy"
                  onClick={(e) =>
                    e.preventDefault()
                  }
                >
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          {errors.acceptTerms && (
            <p className="auth-terms-error">
              {errors.acceptTerms}
            </p>
          )}
        </div>

        {/* SUBMIT */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          icon={UserPlus}
          loading={isSubmitting}
        >
          {isSubmitting
            ? 'Creating account...'
            : 'Create Account'}
        </Button>
      </form>

      <div className="auth-card-footer">
        <p>
          Already have an account?{' '}
          <Link
            to="/login"
            className="auth-switch-link"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;