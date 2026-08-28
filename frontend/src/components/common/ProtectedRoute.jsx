import {
    useEffect,
    useState,
} from 'react';

import {
    Navigate,
} from 'react-router-dom';

import {
    getUserProfileApi,
} from '../../services/user.api';

// PROTECTED ROUTE
//
// Mục đích:
//
// User truy cập route cần đăng nhập
// ↓
// GET /users/profile
// ↓
//
// 200
// → cookie token hợp lệ
// → cho render trang.
//
// 401 / 403
// → chưa đăng nhập / token hết hạn
// → chuyển về /login.
//

const ProtectedRoute = ({
    children,
}) => {
    // null:
    // chưa kiểm tra xong.
    //
    // true:
    // đã đăng nhập.
    //
    // false:
    // chưa đăng nhập.

    const [
        isAuthenticated,
        setIsAuthenticated,
    ] = useState(null);

    const [
        authError,
        setAuthError,
    ] = useState('');

    // CHECK SESSION

    useEffect(() => {
        const checkAuthentication =
            async () => {
                try {
                    // FE không cần đọc JWT.
                    //
                    // Cookie token là httpOnly.
                    //
                    // Axios đã có:
                    // withCredentials: true
                    //
                    // nên browser tự gửi cookie cho Backend.

                    await getUserProfileApi();

                    // API Profile chạy thành công
                    // → session hợp lệ.

                    setIsAuthenticated(
                        true
                    );
                } catch (error) {
                    console.error(
                        'Protected Route auth error:',
                        error
                    );

                    const status =
                        error.response?.status;

                    // 401 / 403
                    // → không có quyền truy cập.

                    if (
                        status === 401 ||
                        status === 403
                    ) {
                        setIsAuthenticated(
                            false
                        );

                        return;
                    }

                    // Nếu là lỗi server/network
                    // thì không nên coi như user logout.

                    setAuthError(
                        'Unable to verify your login session.'
                    );
                }
            };

        checkAuthentication();
    }, []);

    // LOADING

    if (
        isAuthenticated === null &&
        !authError
    ) {
        return (
            <div
                style={{
                    minHeight: '60vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                Checking your session...
            </div>
        );
    }

    // SERVER / NETWORK ERROR

    if (authError) {
        return (
            <div
                style={{
                    minHeight: '60vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {authError}
            </div>
        );
    }

    // NOT LOGGED IN

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // LOGGED IN

    return children;
};

export default ProtectedRoute;