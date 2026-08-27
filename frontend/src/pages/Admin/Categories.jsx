import {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';

import AdminTable from '../../components/admin/AdminTable';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

import {
  Search,
  Plus,
  Edit,
  Trash2,
  FolderTree,
  AlertTriangle,
} from 'lucide-react';

// =====================================================
// CATEGORY API
// =====================================================
//
// GET /category
//
// Dùng endpoint Category public để load danh sách thật.
//
// =====================================================

import {
  getCategories,
} from '../../services/category.api';

// =====================================================
// ADMIN CATEGORY API
// =====================================================
//
// POST   /admin/category
// PATCH  /admin/category/:categoryId
// DELETE /admin/category/:categoryId
//
// =====================================================

import {
  createAdminCategoryApi,
  updateAdminCategoryApi,
  deleteAdminCategoryApi,
} from '../../services/admin.api';

import '../../components/admin/Admin.css';

// =====================================================
// ADMIN CATEGORIES
// =====================================================

export const Categories = () => {
  // ===================================================
  // 1. CATEGORY STATE
  // ===================================================

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    isLoadingCategories,
    setIsLoadingCategories,
  ] = useState(true);

  const [
    categoriesError,
    setCategoriesError,
  ] = useState('');

  // ===================================================
  // 2. SEARCH
  // ===================================================

  const [
    search,
    setSearch,
  ] = useState('');

  // ===================================================
  // 3. ADD / EDIT MODAL
  // ===================================================

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  // null
  // → Add Category
  //
  // object
  // → Edit Category
  const [
    editingCategory,
    setEditingCategory,
  ] = useState(null);

  const [
    formData,
    setFormData,
  ] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const [
    formError,
    setFormError,
  ] = useState('');

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  // ===================================================
  // 4. DELETE
  // ===================================================

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState('');

  // ===================================================
  // 5. MAP BACKEND CATEGORY → UI
  // ===================================================

  const mapBackendCategory =
    (category) => ({
      id:
        category.id,

      name:
        category.name ||
        category.title ||
        'Unnamed Category',

      slug:
        category.slug ||
        '',

      description:
        category.description ||
        '',
    });

  // ===================================================
  // 6. LOAD CATEGORIES
  // ===================================================
  //
  // GET /category
  //
  // Hàm được viết bằng useCallback vì sẽ dùng lại sau:
  //
  // GET lần đầu
  // POST thành công → GET lại
  // PATCH thành công → GET lại
  // DELETE thành công → GET lại
  //
  // ===================================================

  const loadCategories =
    useCallback(
      async (
        showLoading = true
      ) => {
        if (showLoading) {
          setIsLoadingCategories(
            true
          );
        }

        setCategoriesError('');

        try {
          const response =
            await getCategories();

          console.log(
            'Admin Categories GET response:',
            response
          );

          const backendCategories =
            response.data ||
            response.categories ||
            [];

          const mappedCategories =
            Array.isArray(
              backendCategories
            )
              ? backendCategories.map(
                mapBackendCategory
              )
              : [];

          console.log(
            'Mapped Admin Categories:',
            mappedCategories
          );

          setCategories(
            mappedCategories
          );
        } catch (error) {
          console.error(
            'Admin Categories GET error:',
            error
          );

          setCategories([]);

          setCategoriesError(
            error.response
              ?.data
              ?.message ||
            'Không thể tải danh mục.'
          );
        } finally {
          if (showLoading) {
            setIsLoadingCategories(
              false
            );
          }
        }
      },
      []
    );

  // ===================================================
  // 7. LOAD WHEN PAGE OPENS
  // ===================================================

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ===================================================
  // 8. FILTER CATEGORIES
  // ===================================================
  //
  // Search local ở FE.
  //
  // Category ít dữ liệu nên không cần API search riêng.
  //
  // ===================================================

  const filteredCategories =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return categories;
      }

      return categories.filter(
        (cat) => {
          const name =
            String(
              cat.name || ''
            ).toLowerCase();

          const slug =
            String(
              cat.slug || ''
            ).toLowerCase();

          const description =
            String(
              cat.description || ''
            ).toLowerCase();

          return (
            name.includes(
              keyword
            ) ||
            slug.includes(
              keyword
            ) ||
            description.includes(
              keyword
            )
          );
        }
      );
    }, [
      categories,
      search,
    ]);

  // ===================================================
  // 9. OPEN ADD
  // ===================================================

  const handleOpenAdd =
    () => {
      setEditingCategory(
        null
      );

      setFormData({
        name: '',
        slug: '',
        description: '',
      });

      setFormError('');

      setModalOpen(true);
    };

  // ===================================================
  // 10. OPEN EDIT
  // ===================================================

  const handleOpenEdit =
    (category) => {
      setEditingCategory(
        category
      );

      setFormData({
        name:
          category.name ||
          '',

        slug:
          category.slug ||
          '',

        description:
          category.description ||
          '',
      });

      setFormError('');

      setModalOpen(true);
    };

  // ===================================================
  // 11. CLOSE MODAL
  // ===================================================

  const handleCloseModal =
    () => {
      if (isSubmitting) {
        return;
      }

      setModalOpen(false);

      setEditingCategory(
        null
      );

      setFormError('');
    };

  // ===================================================
  // 12. AUTO GENERATE SLUG
  // ===================================================

  const handleNameChange =
    (e) => {
      const value =
        e.target.value;

      const autoSlug =
        value
          .toLowerCase()
          .normalize('NFD')
          .replace(
            /[\u0300-\u036f]/g,
            ''
          )
          .replace(
            /[đĐ]/g,
            'd'
          )
          .replace(
            /[^a-z0-9\s-]/g,
            ''
          )
          .trim()
          .replace(
            /\s+/g,
            '-'
          );

      setFormData(
        (prev) => ({
          ...prev,

          name:
            value,

          // Add mới
          // → auto generate slug.
          //
          // Edit
          // → giữ slug cũ.
          slug:
            editingCategory
              ? prev.slug
              : autoSlug,
        })
      );

      if (formError) {
        setFormError('');
      }
    };

  // ===================================================
  // 13. VALIDATE FORM
  // ===================================================

  const validateForm =
    () => {
      if (
        !formData
          .name
          .trim()
      ) {
        setFormError(
          'Tên danh mục không được để trống.'
        );

        return false;
      }

      if (
        !formData
          .slug
          .trim()
      ) {
        setFormError(
          'Slug không được để trống.'
        );

        return false;
      }

      return true;
    };

  // ===================================================
  // 14. CREATE / UPDATE CATEGORY
  // ===================================================
  //
  // ADD:
  //
  // POST /admin/category
  //
  // EDIT:
  //
  // PATCH /admin/category/:categoryId
  //
  // Sau thành công:
  //
  // GET /category lại
  //
  // Không update local giả.
  //
  // ===================================================

  const handleSubmitForm =
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      if (isSubmitting) {
        return;
      }

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      setFormError('');

      try {
        // =============================================
        // BODY GỬI BACKEND
        // =============================================

        const categoryData = {
          name:
            formData
              .name
              .trim(),

          slug:
            formData
              .slug
              .trim(),

          description:
            formData
              .description
              .trim(),
        };

        console.log(
          'Admin Category payload:',
          categoryData
        );

        // =============================================
        // EDIT
        // PATCH /admin/category/:categoryId
        // =============================================

        if (
          editingCategory
        ) {
          const response =
            await updateAdminCategoryApi(
              editingCategory.id,
              categoryData
            );

          console.log(
            'Admin Category PATCH response:',
            response
          );
        }

        // =============================================
        // ADD
        // POST /admin/category
        // =============================================

        else {
          const response =
            await createAdminCategoryApi(
              categoryData
            );

          console.log(
            'Admin Category POST response:',
            response
          );
        }

        // =============================================
        // REFRESH DATA THẬT
        // =============================================

        await loadCategories(
          false
        );

        setModalOpen(false);

        setEditingCategory(
          null
        );

        setFormData({
          name: '',
          slug: '',
          description: '',
        });
      } catch (error) {
        console.error(
          'Admin Category Submit error:',
          error
        );

        setFormError(
          error.response
            ?.data
            ?.message ||
          (
            editingCategory
              ? 'Không thể cập nhật danh mục.'
              : 'Không thể tạo danh mục.'
          )
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  // ===================================================
  // 15. OPEN DELETE CONFIRM
  // ===================================================

  const handleOpenDelete =
    (category) => {
      setDeleteError('');

      setDeleteTarget(
        category
      );
    };

  // ===================================================
  // 16. CLOSE DELETE
  // ===================================================

  const handleCloseDelete =
    () => {
      if (isDeleting) {
        return;
      }

      setDeleteTarget(null);

      setDeleteError('');
    };

  // ===================================================
  // 17. DELETE CATEGORY
  // ===================================================
  //
  // DELETE /admin/category/:categoryId
  //
  // Sau thành công:
  //
  // GET /category lại
  //
  // ===================================================

  const handleDeleteConfirm =
    async () => {
      if (
        !deleteTarget ||
        isDeleting
      ) {
        return;
      }

      setIsDeleting(true);

      setDeleteError('');

      try {
        const response =
          await deleteAdminCategoryApi(
            deleteTarget.id
          );

        console.log(
          'Admin Category DELETE response:',
          response
        );

        // =============================================
        // GET lại dữ liệu thật.
        // =============================================

        await loadCategories(
          false
        );

        setDeleteTarget(
          null
        );
      } catch (error) {
        console.error(
          'Admin Category DELETE error:',
          error
        );

        setDeleteError(
          error.response
            ?.data
            ?.message ||
          'Không thể xóa danh mục.'
        );
      } finally {
        setIsDeleting(false);
      }
    };

  // ===================================================
  // 18. TABLE COLUMNS
  // ===================================================

  const columns = [
    {
      header:
        'Category Name',
    },

    {
      header:
        'Slug',
    },

    {
      header:
        'Description',
    },

    {
      header:
        'Actions',

      style: {
        textAlign:
          'right',
      },
    },
  ];

  // ===================================================
  // 19. UI
  // ===================================================

  return (
    <div className="admin-page-content">

      {/* =================================================
          CONTROL BAR
      ================================================= */}

      <div className="admin-filter-bar">

        <div className="admin-filter-group">

          <Input
            placeholder="Search category name or slug..."
            value={
              search
            }
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            icon={
              Search
            }
            className="admin-search-input"
          />

        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={
            handleOpenAdd
          }
          disabled={
            isLoadingCategories
          }
        >
          Add Category
        </Button>

      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {isLoadingCategories ? (

        <div
          className="payt-card"
          style={{
            padding:
              '28px',

            textAlign:
              'center',
          }}
        >
          Loading categories...
        </div>

      ) : categoriesError ? (

        // ===============================================
        // ERROR
        // ===============================================

        <div
          className="payt-card"
          style={{
            padding:
              '28px',

            textAlign:
              'center',
          }}
        >

          <AlertTriangle
            size={34}
          />

          <h3>
            Unable to load categories
          </h3>

          <p>
            {
              categoriesError
            }
          </p>

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              loadCategories()
            }
          >
            Try Again
          </Button>

        </div>

      ) : (

        // ===============================================
        // TABLE
        // ===============================================

        <AdminTable
          columns={
            columns
          }
          data={
            filteredCategories
          }
          emptyMessage="Không tìm thấy danh mục phù hợp."
          renderRow={(
            category
          ) => (

            <tr
              key={
                category.id
              }
            >

              {/* NAME */}

              <td>

                <div className="admin-cell-doc">

                  <FolderTree
                    size={18}
                    color="var(--primary-orange)"
                  />

                  <span className="admin-cell-title">
                    {
                      category.name
                    }
                  </span>

                </div>

              </td>

              {/* SLUG */}

              <td>

                <code
                  style={{
                    background:
                      'var(--warm-cream)',

                    padding:
                      '2px 6px',

                    borderRadius:
                      '4px',

                    color:
                      'var(--coral-accent)',
                  }}
                >

                  {
                    category.slug ||
                    '—'
                  }

                </code>

              </td>

              {/* DESCRIPTION */}

              <td
                style={{
                  maxWidth:
                    '300px',
                }}
              >

                {
                  category.description ||
                  '—'
                }

              </td>

              {/* ACTIONS */}

              <td>

                <div
                  className="admin-table-actions"
                  style={{
                    justifyContent:
                      'flex-end',
                  }}
                >

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleOpenEdit(
                        category
                      )
                    }
                    icon={
                      Edit
                    }
                  >
                    Edit
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      handleOpenDelete(
                        category
                      )
                    }
                    icon={
                      Trash2
                    }
                  >
                    Delete
                  </Button>

                </div>

              </td>

            </tr>

          )}
        />

      )}

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {modalOpen && (

        <Modal
          isOpen={
            modalOpen
          }
          onClose={
            handleCloseModal
          }
          title={
            editingCategory
              ? 'Edit Category'
              : 'Add New Category'
          }
          size="md"
          footer={

            <div
              style={{
                display:
                  'flex',

                justifyContent:
                  'flex-end',

                gap:
                  '12px',

                width:
                  '100%',
              }}
            >

              <Button
                variant="secondary"
                onClick={
                  handleCloseModal
                }
                disabled={
                  isSubmitting
                }
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                onClick={
                  handleSubmitForm
                }
                loading={
                  isSubmitting
                }
                disabled={
                  isSubmitting
                }
              >

                {
                  isSubmitting
                    ? (
                      editingCategory
                        ? 'Saving...'
                        : 'Creating...'
                    )
                    : (
                      editingCategory
                        ? 'Save Changes'
                        : 'Create Category'
                    )
                }

              </Button>

            </div>

          }
        >

          <form
            onSubmit={
              handleSubmitForm
            }
            style={{
              display:
                'flex',

              flexDirection:
                'column',

              gap:
                '16px',
            }}
          >

            {/* ERROR */}

            {formError && (

              <div
                style={{
                  color:
                    'var(--error-color)',

                  fontSize:
                    '0.875rem',

                  background:
                    'var(--error-bg)',

                  padding:
                    '8px 12px',

                  borderRadius:
                    '6px',
                }}
              >

                {
                  formError
                }

              </div>

            )}

            {/* NAME */}

            <Input
              label="Category Name"
              placeholder="e.g. Công nghệ thông tin"
              value={
                formData.name
              }
              onChange={
                handleNameChange
              }
              disabled={
                isSubmitting
              }
              required
            />

            {/* SLUG */}

            <Input
              label="Slug"
              placeholder="e.g. cong-nghe-thong-tin"
              value={
                formData.slug
              }
              onChange={(e) => {

                setFormData(
                  (prev) => ({
                    ...prev,

                    slug:
                      e.target.value,
                  })
                );

                setFormError('');

              }}
              disabled={
                isSubmitting
              }
              required
            />

            {/* DESCRIPTION */}

            <div className="payt-input-group">

              <label className="payt-input-label">
                Description
              </label>

              <textarea
                className="payt-input"
                rows={3}
                placeholder="Mô tả ngắn gọn về danh mục..."
                value={
                  formData.description
                }
                disabled={
                  isSubmitting
                }
                onChange={(e) => {

                  setFormData(
                    (prev) => ({
                      ...prev,

                      description:
                        e.target.value,
                    })
                  );

                  setFormError('');

                }}
                style={{
                  resize:
                    'vertical',
                }}
              />

            </div>

          </form>

        </Modal>

      )}

      {/* =================================================
          DELETE CONFIRM MODAL
      ================================================= */}

      <AdminConfirmModal
        isOpen={
          !!deleteTarget
        }
        onClose={
          handleCloseDelete
        }
        onConfirm={
          handleDeleteConfirm
        }
        title="Xóa danh mục"
        message={
          deleteError
            ? `${deleteError}`
            : `Bạn có chắc chắn muốn xóa danh mục "${deleteTarget?.name}" không?`
        }
        confirmText={
          isDeleting
            ? 'Đang xóa...'
            : 'Xóa danh mục'
        }
      />

    </div>
  );
};

export default Categories;