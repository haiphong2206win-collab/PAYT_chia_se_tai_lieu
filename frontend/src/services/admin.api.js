import api from './api';

// =====================================================
// ADMIN CATEGORY API
// =====================================================

// =====================================================
// CREATE CATEGORY
// POST /admin/category
// =====================================================

export const createAdminCategoryApi = async (
    categoryData
) => {
    const response = await api.post(
        '/admin/category',
        categoryData
    );

    return response.data;
};

// =====================================================
// UPDATE CATEGORY
// PATCH /admin/category/:categoryId
// =====================================================

export const updateAdminCategoryApi = async (
    categoryId,
    categoryData
) => {
    const response = await api.patch(
        `/admin/category/${categoryId}`,
        categoryData
    );

    return response.data;
};

// =====================================================
// DELETE CATEGORY
// DELETE /admin/category/:categoryId
// =====================================================

export const deleteAdminCategoryApi = async (
    categoryId
) => {
    const response = await api.delete(
        `/admin/category/${categoryId}`
    );

    return response.data;
};

// =====================================================
// ADMIN DOCUMENT API
// =====================================================

// =====================================================
// GET ALL ADMIN DOCUMENTS
// GET /admin/documents
// =====================================================

export const getAdminDocumentsApi = async () => {
    const response = await api.get(
        '/admin/documents'
    );

    return response.data;
};

// =====================================================
// UPDATE DOCUMENT STATUS
// PATCH /admin/documents/:documentId/status
//
// body:
// {
//   status: "approved" | "rejected" | "pending"
// }
// =====================================================

export const updateAdminDocumentStatusApi = async (
    documentId,
    status
) => {
    const response = await api.patch(
        `/admin/documents/${documentId}/status`,
        {
            status,
        }
    );

    return response.data;
};

// =====================================================
// DELETE ADMIN DOCUMENT
// DELETE /admin/documents/:documentId
// =====================================================

export const deleteAdminDocumentApi = async (
    documentId
) => {
    const response = await api.delete(
        `/admin/documents/${documentId}`
    );

    return response.data;
};

// =====================================================
// ADMIN USER API
// =====================================================

// GET /admin/users
export const getAdminUsersApi = async () => {
    const response = await api.get(
        '/admin/users'
    );

    return response.data;
};

// PATCH /admin/users/:userId/status
//
// body:
// {
//   status: "active" | "locked"
// }
export const updateAdminUserStatusApi = async (
    userId,
    status
) => {
    const response = await api.patch(
        `/admin/users/${userId}/status`,
        {
            status,
        }
    );

    return response.data;
};

// PATCH /admin/users/:userId/role
//
// body:
// {
//   role: "admin" | "student"
// }
export const updateAdminUserRoleApi = async (
    userId,
    role
) => {
    const response = await api.patch(
        `/admin/users/${userId}/role`,
        {
            role,
        }
    );

    return response.data;
};




// =====================================================
// ADMIN REVIEW API
// =====================================================

// GET /admin/reviews
export const getAdminReviewsApi = async () => {
    const response = await api.get(
        '/admin/reviews'
    );

    return response.data;
};

// DELETE /admin/reviews/:reviewId
export const deleteAdminReviewApi = async (
    reviewId
) => {
    const response = await api.delete(
        `/admin/reviews/${reviewId}`
    );

    return response.data;
};