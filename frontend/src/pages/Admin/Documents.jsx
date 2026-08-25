import { useState, useMemo } from 'react';
import { initialAdminDocuments } from '../../mock/admin/documents';
import AdminTable from '../../components/admin/AdminTable';
import StatusBadge from '../../components/admin/StatusBadge';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { Search, CheckCircle, XCircle, Trash2, Eye, FileText } from 'lucide-react';
import '../../components/admin/Admin.css';

export const Documents = () => {
  const [documents, setDocuments] = useState(initialAdminDocuments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [previewDoc, setPreviewDoc] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filtered dataset
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.uploader.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.uploader.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || doc.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [documents, search, statusFilter]);

  // Paginated dataset
  const paginatedDocs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDocs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDocs, currentPage]);

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;

  // Handlers
  const handleApprove = (docId) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, status: 'approved' } : doc))
    );
  };

  const handleReject = (docId) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, status: 'rejected' } : doc))
    );
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      setDocuments((prev) => prev.filter((doc) => doc.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const columns = [
    { header: 'Document' },
    { header: 'Uploader' },
    { header: 'Category' },
    { header: 'Upload Date' },
    { header: 'Status' },
    { header: 'Actions', style: { textAlign: 'right' } }
  ];

  return (
    <div className="admin-page-content">
      {/* Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          <Input
            placeholder="Search document title or uploader..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            icon={Search}
            className="admin-search-input"
          />
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { label: 'Tất cả trạng thái', value: 'all' },
              { label: 'Chờ duyệt (Pending)', value: 'pending' },
              { label: 'Đã duyệt (Approved)', value: 'approved' },
              { label: 'Từ chối (Rejected)', value: 'rejected' }
            ]}
            className="admin-filter-select"
          />
        </div>
      </div>

      {/* Documents Table */}
      <AdminTable
        columns={columns}
        data={paginatedDocs}
        emptyMessage="Không tìm thấy tài liệu phù hợp."
        renderRow={(doc) => (
          <tr key={doc.id}>
            <td>
              <div className="admin-cell-doc">
                <FileText size={20} color="var(--primary-orange)" />
                <div>
                  <div className="admin-cell-title">{doc.title}</div>
                  <div className="admin-cell-subtitle">{doc.fileType.toUpperCase()} • {doc.fileSize}</div>
                </div>
              </div>
            </td>
            <td>
              <div className="admin-cell-title">{doc.uploader.name}</div>
              <div className="admin-cell-subtitle">{doc.uploader.email}</div>
            </td>
            <td>{doc.category}</td>
            <td>{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</td>
            <td>
              <StatusBadge value={doc.status} />
            </td>
            <td>
              <div className="admin-table-actions" style={{ justifyContent: 'flex-end' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewDoc(doc)}
                  icon={Eye}
                >
                  View
                </Button>
                {doc.status !== 'approved' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(doc.id)}
                    icon={CheckCircle}
                  >
                    Approve
                  </Button>
                )}
                {doc.status !== 'rejected' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleReject(doc.id)}
                    icon={XCircle}
                  >
                    Reject
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteTarget(doc)}
                  icon={Trash2}
                >
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination-bar">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title="Document Details Preview"
          size="md"
          footer={
            <Button variant="secondary" onClick={() => setPreviewDoc(null)}>
              Close
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <strong>Title:</strong> <p style={{ margin: '4px 0 0' }}>{previewDoc.title}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <strong>Uploader:</strong> {previewDoc.uploader.name}
              </div>
              <div>
                <strong>Email:</strong> {previewDoc.uploader.email}
              </div>
              <div>
                <strong>Category:</strong> {previewDoc.category}
              </div>
              <div>
                <strong>Status:</strong> <StatusBadge value={previewDoc.status} />
              </div>
              <div>
                <strong>File Format:</strong> {previewDoc.fileType.toUpperCase()}
              </div>
              <div>
                <strong>Downloads:</strong> {previewDoc.downloads}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Xóa tài liệu"
        message={`Bạn có chắc chắn muốn xóa tài liệu "${deleteTarget?.title}" không? Action này chỉ xoá dữ liệu tạm thời trong mock state.`}
        confirmText="Xóa tài liệu"
      />
    </div>
  );
};

export default Documents;
