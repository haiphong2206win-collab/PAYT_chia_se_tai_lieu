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
import Select from '../../components/common/Select';
import Pagination from '../../components/common/Pagination';

import {
  Search,
  Star,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

import {
  getAdminReviewsApi,
  deleteAdminReviewApi,
} from '../../services/admin.api';

import '../../components/admin/Admin.css';

// =====================================================
// FORMAT DATE
// =====================================================

const formatDate = (dateValue) => {
  if (!dateValue) {
    return '—';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('vi-VN');
};

// =====================================================
// MAP BACKEND REVIEW → ADMIN UI
// =====================================================
//
// BE hiện trả dữ liệu review thật gồm:
// - id
// - document_id
// - user_id
// - rating
// - comment
// - created_at
// - title
//
// Không dùng mock data.
// =====================================================

const mapAdminReview = (review) => {
  const user =
    review.user ||
    review.reviewer ||
    {};

  const document =
    review.document ||
    {};

  return {
    id:
      review.id ||
      review.review_id ||
      '',

    rating:
      Number(
        review.rating ??
        review.star ??
        0
      ) || 0,

    comment:
      review.comment ||
      review.content ||
      review.review ||
      '',

    createdAt:
      review.created_at ||
      review.createdAt ||
      '',

    documentId:
      review.document_id ||
      review.documentId ||
      document.id ||
      null,

    // BE hiện trả title trực tiếp bằng field "title"
    documentTitle:
      review.document_title ||
      review.documentTitle ||
      review.title ||
      document.title ||
      'Unknown Document',

    user: {
      id:
        review.user_id ||
        review.reviewer_id ||
        user.id ||
        null,

      name:
        review.user_name ||
        review.reviewer_name ||
        review.full_name ||
        user.full_name ||
        user.fullName ||
        user.name ||
        'Unknown User',

      email:
        review.user_email ||
        review.reviewer_email ||
        user.email ||
        '',
    },
  };
};

// =====================================================
// ADMIN REVIEWS
// =====================================================

export const Reviews = () => {
  // ===================================================
  // DATA
  // ===================================================

  const [
    reviews,
    setReviews,
  ] = useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState('');

  // ===================================================
  // FILTER
  // ===================================================

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    ratingFilter,
    setRatingFilter,
  ] = useState('all');

  // ===================================================
  // PAGINATION
  // ===================================================

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const itemsPerPage = 5;

  // ===================================================
  // DELETE STATE
  // ===================================================

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  // ===================================================
  // MESSAGE STATE
  // ===================================================

  const [
    actionError,
    setActionError,
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  // ===================================================
  // GET /admin/reviews
  // ===================================================

  const loadAdminReviews =
    useCallback(async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const response =
          await getAdminReviewsApi();

        const backendReviews =
          response?.reviews ||
          response?.data?.reviews ||
          (
            Array.isArray(
              response?.data
            )
              ? response.data
              : Array.isArray(
                response
              )
                ? response
                : []
          );

        const mappedReviews =
          Array.isArray(
            backendReviews
          )
            ? backendReviews.map(
              mapAdminReview
            )
            : [];

        setReviews(
          mappedReviews
        );
      } catch (error) {
        console.error(
          'Admin Reviews API error:',
          error
        );

        setReviews([]);

        setLoadError(
          error.response
            ?.data
            ?.message ||
          'Unable to load reviews.'
        );
      } finally {
        setIsLoading(
          false
        );
      }
    }, []);

  useEffect(() => {
    loadAdminReviews();
  }, [loadAdminReviews]);

  // ===================================================
  // FILTERED REVIEWS
  // ===================================================

  const filteredReviews =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return reviews.filter(
        (review) => {
          const userName =
            String(
              review.user?.name ||
              ''
            ).toLowerCase();

          const userEmail =
            String(
              review.user?.email ||
              ''
            ).toLowerCase();

          const documentTitle =
            String(
              review.documentTitle ||
              ''
            ).toLowerCase();

          const comment =
            String(
              review.comment ||
              ''
            ).toLowerCase();

          const matchesSearch =
            !keyword ||
            userName.includes(
              keyword
            ) ||
            userEmail.includes(
              keyword
            ) ||
            documentTitle.includes(
              keyword
            ) ||
            comment.includes(
              keyword
            );

          const matchesRating =
            ratingFilter ===
            'all' ||
            review.rating ===
            Number(
              ratingFilter
            );

          return (
            matchesSearch &&
            matchesRating
          );
        }
      );
    }, [
      reviews,
      search,
      ratingFilter,
    ]);

  // ===================================================
  // PAGINATION
  // ===================================================

  const paginatedReviews =
    useMemo(() => {
      const startIndex =
        (
          currentPage - 1
        ) * itemsPerPage;

      return filteredReviews.slice(
        startIndex,
        startIndex +
        itemsPerPage
      );
    }, [
      filteredReviews,
      currentPage,
    ]);

  const totalPages =
    Math.ceil(
      filteredReviews.length /
      itemsPerPage
    ) || 1;

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  // ===================================================
  // SUCCESS MESSAGE
  // ===================================================

  const showSuccessMessage =
    (message) => {
      setSuccessMessage(
        message
      );

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    };

  // ===================================================
  // DELETE REVIEW
  //
  // DELETE /admin/reviews/:reviewId
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
      setActionError('');

      try {
        const response =
          await deleteAdminReviewApi(
            deleteTarget.id
          );

        // DELETE thành công
        // → GET lại dữ liệu thật từ BE
        await loadAdminReviews();

        setDeleteTarget(null);

        showSuccessMessage(
          response?.message ||
          'Review deleted successfully!'
        );
      } catch (error) {
        console.error(
          'Admin Delete Review API error:',
          error
        );

        setActionError(
          error.response
            ?.data
            ?.message ||
          'Unable to delete review.'
        );
      } finally {
        setIsDeleting(
          false
        );
      }
    };

  // ===================================================
  // RENDER STARS
  // ===================================================

  const renderStars = (
    rating
  ) => {
    const normalizedRating =
      Math.max(
        0,
        Math.min(
          5,
          Number(rating) ||
          0
        )
      );

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          color: '#F59E42',
        }}
      >
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <Star
            key={index}
            size={14}
            fill={
              index <
                normalizedRating
                ? '#F59E42'
                : 'none'
            }
            stroke="#F59E42"
          />
        ))}

        <span
          style={{
            fontSize:
              '0.8rem',
            marginLeft:
              '4px',
            color:
              'var(--secondary-text)',
          }}
        >
          (
          {normalizedRating}
          /5)
        </span>
      </div>
    );
  };

  // ===================================================
  // TABLE COLUMNS
  // ===================================================

  const columns = [
    {
      header: 'User',
    },
    {
      header: 'Document',
    },
    {
      header: 'Rating',
    },
    {
      header: 'Comment',
    },
    {
      header: 'Date',
    },
    {
      header: 'Actions',
      style: {
        textAlign:
          'right',
      },
    },
  ];

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="admin-page-content">

      {/* FILTER BAR */}

      <div className="admin-filter-bar">
        <div className="admin-filter-group">

          <Input
            placeholder="Search comment, document or reviewer..."
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              );

              setCurrentPage(1);
            }}
            icon={Search}
            className="admin-search-input"
          />

          <Select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(
                e.target.value
              );

              setCurrentPage(1);
            }}
            options={[
              {
                label:
                  'Tất cả đánh giá',
                value: 'all',
              },
              {
                label:
                  '5 Sao',
                value: '5',
              },
              {
                label:
                  '4 Sao',
                value: '4',
              },
              {
                label:
                  '3 Sao',
                value: '3',
              },
              {
                label:
                  '2 Sao',
                value: '2',
              },
              {
                label:
                  '1 Sao',
                value: '1',
              },
            ]}
            className="admin-filter-select"
          />

        </div>
      </div>

      {/* SUCCESS */}

      {successMessage && (
        <div
          className="payt-card"
          style={{
            marginBottom:
              '16px',
          }}
        >
          <CheckCircle
            size={18}
          />{' '}

          {
            successMessage
          }
        </div>
      )}

      {/* ACTION ERROR */}

      {actionError && (
        <div
          className="payt-card"
          style={{
            marginBottom:
              '16px',
          }}
        >
          <AlertTriangle
            size={18}
          />{' '}

          {
            actionError
          }
        </div>
      )}

      {/* LOAD ERROR */}

      {loadError && (
        <div
          className="payt-card"
          style={{
            marginBottom:
              '16px',
          }}
        >
          <AlertTriangle
            size={18}
          />{' '}

          {
            loadError
          }
        </div>
      )}

      {/* REVIEWS TABLE */}

      {isLoading ? (
        <div className="payt-card">
          Loading reviews...
        </div>
      ) : (
        <>
          <AdminTable
            columns={columns}
            data={
              paginatedReviews
            }
            emptyMessage="Không tìm thấy đánh giá phù hợp."
            renderRow={(
              review
            ) => (
              <tr
                key={
                  review.id
                }
              >

                {/* USER */}

                <td>
                  <div className="admin-cell-title">
                    {
                      review
                        .user
                        .name
                    }
                  </div>

                  <div className="admin-cell-subtitle">
                    {
                      review
                        .user
                        .email ||
                      '—'
                    }
                  </div>
                </td>

                {/* DOCUMENT */}

                <td
                  style={{
                    maxWidth:
                      '220px',
                  }}
                >
                  <div
                    className="admin-cell-title"
                    style={{
                      whiteSpace:
                        'normal',
                    }}
                  >
                    {
                      review
                        .documentTitle
                    }
                  </div>
                </td>

                {/* RATING */}

                <td>
                  {
                    renderStars(
                      review.rating
                    )
                  }
                </td>

                {/* COMMENT */}

                <td
                  style={{
                    maxWidth:
                      '300px',
                    fontStyle:
                      'italic',
                  }}
                >
                  {review.comment
                    ? `"${review.comment}"`
                    : '—'}
                </td>

                {/* DATE */}

                <td>
                  {
                    formatDate(
                      review.createdAt
                    )
                  }
                </td>

                {/* ACTION */}

                <td>
                  <div
                    className="admin-table-actions"
                    style={{
                      justifyContent:
                        'flex-end',
                    }}
                  >
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        setDeleteTarget(
                          review
                        )
                      }
                      icon={
                        Trash2
                      }
                      disabled={
                        isDeleting
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </td>

              </tr>
            )}
          />

          {/* PAGINATION */}

          {totalPages > 1 && (
            <div className="admin-pagination-bar">

              <Pagination
                currentPage={
                  currentPage
                }
                totalPages={
                  totalPages
                }
                onPageChange={(
                  page
                ) =>
                  setCurrentPage(
                    page
                  )
                }
              />

            </div>
          )}
        </>
      )}

      {/* DELETE CONFIRMATION */}

      <AdminConfirmModal
        isOpen={
          !!deleteTarget
        }
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(
              null
            );

            setActionError('');
          }
        }}
        onConfirm={
          handleDeleteConfirm
        }
        title="Xóa đánh giá"
        message={
          `Bạn có chắc chắn muốn xóa đánh giá của người dùng "${deleteTarget?.user?.name || 'Unknown User'}" cho tài liệu "${deleteTarget?.documentTitle || 'Unknown Document'}" không? Hành động này sẽ xóa đánh giá thật khỏi hệ thống.`
        }
        confirmText={
          isDeleting
            ? 'Đang xóa...'
            : 'Xóa đánh giá'
        }
      />

    </div>
  );
};

export default Reviews;