import { useState } from 'react';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
} from 'lucide-react';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

import { loginApi } from '../../services/auth.api';

import './Auth.css';

export const Login = () => {
  // =====================================================
  // ROUTER
  // =====================================================

  const navigate = useNavigate();

  // =====================================================
  // 1. FORM STATE
  // =====================================================

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  // Hiện tại chỉ là state phía FE.
  // Chưa gửi rememberMe sang Backend.
  const [rememberMe, setRememberMe] =
    useState(false);

  // Chứa lỗi validation FE + lỗi Backend
  const [errors, setErrors] = useState({});

  // Thông báo khi Backend login thành công
  const [successMessage, setSuccessMessage] =
    useState('');

  // Dùng để khóa nút trong lúc đang gửi request
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // =====================================================
  // 2. VALIDATE EMAIL
  // =====================================================

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

  // =====================================================
  // 3. VALIDATE PASSWORD
  // =====================================================

  const validatePassword = (val) => {
    if (!val) {
      return 'Password is required';
    }

    return '';
  };

  // =====================================================
  // 4. VALIDATE TOÀN FORM
  // =====================================================

  const validateForm = () => {
    const newErrors = {};

    const emailErr = validateEmail(email);

    if (emailErr) {
      newErrors.email = emailErr;
    }

    const passwordErr =
      validatePassword(password);

    if (passwordErr) {
      newErrors.password = passwordErr;
    }

    return newErrors;
  };

  // =====================================================
  // 5. LOGIN THẬT VỚI BACKEND
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tránh user bấm Login nhiều lần
    if (isSubmitting) {
      return;
    }

    setSuccessMessage('');

    // Kiểm tra form phía FE trước
    const validationErrors = validateForm();

    if (
      Object.keys(validationErrors).length > 0
    ) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // Backend login chỉ cần email + password
      const credentials = {
        email: email.trim(),
        password: password,
      };

      // POST /auth/login
      //
      // Backend hiện trả dạng:
      //
      // {
      //   message: "...",
      //   user: {
      //     id: "...",
      //     email: "...",
      //     role: "admin" | "student",
      //     ...
      //   }
      // }
      const response =
        await loginApi(credentials);

      // =================================================
      // ROLE TỪ BACKEND
      // =================================================

      // BE hiện đã trả role trong response login.
      // Tạm lưu role vào sessionStorage để
      // AdminProtectedRoute sử dụng.
      //
      // Đây chỉ là trạng thái điều hướng phía FE.
      // Quyền truy cập API Admin thật vẫn do Backend
      // kiểm tra qua JWT cookie + role.
      const userRole = String(
        response?.user?.role || 'student'
      ).toLowerCase();

      sessionStorage.setItem(
        'userRole',
        userRole
      );

      // Hiển thị message Backend trả về
      setSuccessMessage(
        response?.message ||
        'Login successful!'
      );

      // Xóa password khỏi form sau khi login
      setPassword('');

      // =================================================
      // REDIRECT THEO ROLE
      // =================================================

      if (userRole === 'admin') {
        // Admin đăng nhập xong đi thẳng vào
        // khu vực quản trị.
        navigate('/admin/documents', {
          replace: true,
        });

        return;
      }

      // Student / user bình thường
      // quay về Home.
      navigate('/', {
        replace: true,
      });
    } catch (error) {
      console.error(
        'Login API error:',
        error
      );

      // Nếu login thất bại thì không giữ role
      // cũ trong sessionStorage.
      sessionStorage.removeItem('userRole');

      // Lấy message thật Backend trả về nếu có
      const apiMessage =
        error.response?.data?.message ||
        'Login failed. Please check your email and password.';

      setErrors((prev) => ({
        ...prev,
        api: apiMessage,
      }));
    } finally {
      // Dù thành công hay lỗi đều mở lại nút Login.
      // Nếu navigate thành công component sẽ unmount.
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // 6. EMAIL CHANGE
  // =====================================================

  const handleEmailChange = (e) => {
    const val = e.target.value;

    setEmail(val);
    setSuccessMessage('');

    // User nhập lại thì xóa lỗi API cũ
    if (errors.api) {
      setErrors((prev) => ({
        ...prev,
        api: '',
      }));
    }

    // Nếu input đang có lỗi thì validate lại
    if (errors.email) {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(val),
      }));
    }
  };

  // =====================================================
  // 7. PASSWORD CHANGE
  // =====================================================

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
  };

  // =====================================================
  // 8. UI
  // =====================================================

  return (
    <div className="auth-form-content">
      <div className="auth-header">
        <h2 className="auth-title">
          Welcome back
        </h2>

        <p className="auth-subtitle">
          Log in to continue to PayT
        </p>
      </div>

      {/* LOGIN THÀNH CÔNG */}
      {successMessage && (
        <div className="auth-success-alert">
          <CheckCircle2
            size={20}
            style={{
              flexShrink: 0,
            }}
          />

          <span>{successMessage}</span>
        </div>
      )}

      {/* LỖI BACKEND */}
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
        {/* EMAIL */}
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

        {/* PASSWORD */}
        <Input
          label="Password"
          type={
            showPassword
              ? 'text'
              : 'password'
          }
          placeholder="Enter your password"
          value={password}
          onChange={handlePasswordChange}
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

        {/* REMEMBER + FORGOT PASSWORD */}
        <div className="auth-row-between">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) =>
                setRememberMe(
                  e.target.checked
                )
              }
              className="custom-checkbox"
            />

            <span>Remember me</span>
          </label>

          <a
            href="#forgot"
            className="forgot-link"
            onClick={(e) =>
              e.preventDefault()
            }
          >
            Forgot password?
          </a>
        </div>

        {/* LOGIN BUTTON */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          icon={LogIn}
          loading={isSubmitting}
        >
          {isSubmitting
            ? 'Logging in...'
            : 'Log In'}
        </Button>
      </form>

      <div className="auth-card-footer">
        <p>
          Don't have an account?{' '}
          <Link
            to="/register"
            className="auth-switch-link"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;