import api from './api';

// USER PROFILE REQUEST CACHE
//
// ProtectedRoute và Profile đều cần:
//
// GET /users/profile
//
// Trong môi trường dev, React StrictMode cũng có thể
// chạy useEffect 2 lần.
//
// Nếu nhiều request giống nhau được gửi quá nhanh,
// Backend có thể trả:
// 429 Too Many Requests.
//
// Giải pháp:
//
// 1. Nếu request profile đang chạy
//    → dùng chung Promise.
//
// 2. Nếu vừa GET profile thành công
//    → cache ngắn 3 giây.
//
// 3. Sau update profile / logout
//    → xóa cache.
//

let profileCache = null;
let profileCacheTime = 0;
let profileRequestPromise = null;

const PROFILE_CACHE_TTL = 3000;

// CLEAR USER PROFILE CACHE

export const clearUserProfileCache = () => {
  profileCache = null;
  profileCacheTime = 0;
  profileRequestPromise = null;
};

// GET USER PROFILE
// GET /users/profile

export const getUserProfileApi = async (
  options = {}
) => {
  const {
    force = false,
  } = options;

  const now = Date.now();

  // CASE 1:
  // Cache còn mới → dùng lại.
  // Không gọi Backend.

  if (
    !force &&
    profileCache &&
    now - profileCacheTime < PROFILE_CACHE_TTL
  ) {
    return profileCache;
  }

  // CASE 2:
  // Request đang chạy → dùng chung request.

  if (profileRequestPromise) {
    return profileRequestPromise;
  }

  // CASE 3:
  // Gọi Backend thật.

  profileRequestPromise = api
    .get('/users/profile')
    .then((response) => {
      const data =
        response.data;

      // Lưu cache ngắn.
      profileCache =
        data;

      profileCacheTime =
        Date.now();

      return data;
    });

  try {
    return await profileRequestPromise;
  } finally {
    // Request đã hoàn thành.
    // Cache vẫn tồn tại trong 3 giây.
    profileRequestPromise = null;
  }
};

// UPDATE USER PROFILE
// PATCH /users/profile

export const updateUserProfileApi = async (
  userData
) => {
  const response =
    await api.patch(
      '/users/profile',
      userData
    );

  // Profile thay đổi
  // → cache cũ không còn chính xác.
  clearUserProfileCache();

  return response.data;
};

// GET MY DOCUMENTS
// GET /users/my-documents

export const getMyDocumentsApi = async () => {
  const response =
    await api.get(
      '/users/my-documents'
    );

  return response.data;
};

// GET SAVED DOCUMENTS
// GET /users/saved-document

export const getSavedDocumentsApi = async () => {
  const response =
    await api.get(
      '/users/saved-document'
    );

  return response.data;
};