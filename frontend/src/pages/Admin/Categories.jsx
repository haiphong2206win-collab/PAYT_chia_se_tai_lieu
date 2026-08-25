import { useState, useMemo } from 'react';
import { initialAdminCategories } from '../../mock/admin/categories';
import AdminTable from '../../components/admin/AdminTable';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { Search, Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import '../../components/admin/Admin.css';

export const Categories = () => {
  const [categories, setCategories] = useState(initialAdminCategories);
  const [search, setSearch] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null if adding
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      return (
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.slug.toLowerCase().includes(search.toLowerCase()) ||
        cat.description.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [categories, search]);

  // Open modal for Add
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '' });
    setFormError('');
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, slug: cat.slug, description: cat.description });
    setFormError('');
    setModalOpen(true);
  };

  // Auto generate slug from name
  const handleNameChange = (e) => {
    const val = e.target.value;
    const autoSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: editingCategory ? prev.slug : autoSlug
    }));
  };

  // Submit Add/Edit form
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Tên danh mục không được để trống');
      return;
    }
    if (!formData.slug.trim()) {
      setFormError('Slug không được để trống');
      return;
    }

    if (editingCategory) {
      // Update existing
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id
            ? { ...cat, ...formData }
            : cat
        )
      );
    } else {
      // Create new
      const newCat = {
        id: `cat-${Date.now()}`,
        ...formData
      };
      setCategories((prev) => [newCat, ...prev]);
    }

    setModalOpen(false);
  };

  // Delete category
  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      setCategories((prev) => prev.filter((cat) => cat.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const columns = [
    { header: 'Category Name' },
    { header: 'Slug' },
    { header: 'Description' },
    { header: 'Actions', style: { textAlign: 'right' } }
  ];

  return (
    <div className="admin-page-content">
      {/* Control Bar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          <Input
            placeholder="Search category name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
            className="admin-search-input"
          />
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <AdminTable
        columns={columns}
        data={filteredCategories}
        emptyMessage="Không tìm thấy danh mục phù hợp."
        renderRow={(cat) => (
          <tr key={cat.id}>
            <td>
              <div className="admin-cell-doc">
                <FolderTree size={18} color="var(--primary-orange)" />
                <span className="admin-cell-title">{cat.name}</span>
              </div>
            </td>
            <td>
              <code style={{ background: 'var(--warm-cream)', padding: '2px 6px', borderRadius: '4px', color: 'var(--coral-accent)' }}>
                {cat.slug}
              </code>
            </td>
            <td style={{ maxWidth: '300px' }}>{cat.description}</td>
            <td>
              <div className="admin-table-actions" style={{ justifyContent: 'flex-end' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(cat)}
                  icon={Edit}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteTarget(cat)}
                  icon={Trash2}
                >
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCategory ? 'Edit Category' : 'Add New Category'}
          size="md"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmitForm}>
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formError && (
              <div style={{ color: 'var(--error-color)', fontSize: '0.875rem', background: 'var(--error-bg)', padding: '8px 12px', borderRadius: '6px' }}>
                {formError}
              </div>
            )}
            <Input
              label="Category Name"
              placeholder="e.g. Công nghệ thông tin"
              value={formData.name}
              onChange={handleNameChange}
              required
            />
            <Input
              label="Slug"
              placeholder="e.g. cong-nghe-thong-tin"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
            <div className="payt-input-group">
              <label className="payt-input-label">Description</label>
              <textarea
                className="payt-input"
                rows={3}
                placeholder="Mô tả ngắn gọn về danh mục..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Xóa danh mục"
        message={`Bạn có chắc chắn muốn xóa danh mục "${deleteTarget?.name}" không?`}
        confirmText="Xóa danh mục"
      />
    </div>
  );
};

export default Categories;
