import api from './api';

// =====================================================
// ADMIN CATEGORY API
// =====================================================
//
// Categories.jsx
//      ↓
// admin.api.js
//      ↓
// api.js
//      ↓
// Backend
//
// Không gọi Axios trực tiếp trong page.
// =====================================================

// =====================================================
// CREATE CATEGORY
// POST /admin/category
// =====================================================
//
// Body:
//
// {
//   name: "...",
//   slug: "...",
//   description: "..."
// }
//
// =====================================================

export const createAdminCategoryApi = async (
    categoryData
) => {
    const response =
        await api.post(
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
    const response =
        await api.patch(
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
    const response =
        await api.delete(
            `/admin/category/${categoryId}`
        );

    return response.data;
};