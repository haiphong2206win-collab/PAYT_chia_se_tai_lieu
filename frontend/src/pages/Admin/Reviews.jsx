import { useState, useMemo } from 'react';
import { initialAdminReviews } from '../../mock/admin/reviews';
import AdminTable from '../../components/admin/AdminTable';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Pagination from '../../components/common/Pagination';
import { Search, Star, Trash2 } from 'lucide-react';
import '../../components/admin/Admin.css';

export const Reviews = () => {
  const [reviews, setReviews] = useState(initialAdminReviews);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filtered dataset
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      const matchesSearch =
        rev.user.name.toLowerCase().includes(search.toLowerCase()) ||
        rev.user.email.toLowerCase().includes(search.toLowerCase()) ||
        rev.documentTitle.toLowerCase().includes(search.toLowerCase()) ||
        rev.comment.toLowerCase().includes(search.toLowerCase());

      const matchesRating =
        ratingFilter === 'all' || rev.rating === parseInt(ratingFilter, 10);

      return matchesSearch && matchesRating;
    });
  }, [reviews, search, ratingFilter]);

  // Paginated dataset
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReviews, currentPage]);

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage) || 1;

  // Handlers
  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#F59E42' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            fill={i < rating ? '#F59E42' : 'none'}
            stroke="#F59E42"
          />
        ))}
        <span style={{ fontSize: '0.8rem', marginLeft: '4px', color: 'var(--secondary-text)' }}>
          ({rating}/5)
        </span>
      </div>
    );
  };

  const columns = [
    { header: 'User' },
    { header: 'Document' },
    { header: 'Rating' },
    { header: 'Comment' },
    { header: 'Date' },
    { header: 'Actions', style: { textAlign: 'right' } }
  ];

  return (
    <div className="admin-page-content">
      {/* Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          <Input
            placeholder="Search comment, document or reviewer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            icon={Search}
            className="admin-search-input"
          />
          <Select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { label: 'Tất cả đánh giá', value: 'all' },
              { label: '5 Sao', value: '5' },
              { label: '4 Sao', value: '4' },
              { label: '3 Sao', value: '3' },
              { label: '2 Sao', value: '2' },
              { label: '1 Sao', value: '1' }
            ]}
            className="admin-filter-select"
          />
        </div>
      </div>

      {/* Reviews Table */}
      <AdminTable
        columns={columns}
        data={paginatedReviews}
        emptyMessage="Không tìm thấy đánh giá phù hợp."
        renderRow={(rev) => (
          <tr key={rev.id}>
            <td>
              <div className="admin-cell-title">{rev.user.name}</div>
              <div className="admin-cell-subtitle">{rev.user.email}</div>
            </td>
            <td style={{ maxWidth: '220px' }}>
              <div className="admin-cell-title" style={{ whiteSpace: 'normal' }}>
                {rev.documentTitle}
              </div>
            </td>
            <td>{renderStars(rev.rating)}</td>
            <td style={{ maxWidth: '300px', fontStyle: 'italic' }}>
              "{rev.comment}"
            </td>
            <td>{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</td>
            <td>
              <div className="admin-table-actions" style={{ justifyContent: 'flex-end' }}>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteTarget(rev)}
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

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Xóa đánh giá"
        message={`Bạn có chắc chắn muốn xóa đánh giá của người dùng "${deleteTarget?.user.name}" cho tài liệu "${deleteTarget?.documentTitle}" không?`}
        confirmText="Xóa đánh giá"
      />
    </div>
  );
};

export default Reviews;
