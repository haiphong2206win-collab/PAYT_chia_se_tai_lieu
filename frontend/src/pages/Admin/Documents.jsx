import {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';

import AdminTable from '../../components/admin/AdminTable';
import StatusBadge from '../../components/admin/StatusBadge';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';

import {
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  FileText,
  AlertTriangle,
} from 'lucide-react';

import {
  getAdminDocumentsApi,
  updateAdminDocumentStatusApi,
  deleteAdminDocumentApi,
} from '../../services/admin.api';

import '../../components/admin/Admin.css';

// =====================================================
// FORMAT FILE SIZE
// =====================================================

const formatFileSize = (bytes) => {
  const size = Number(bytes || 0);

  if (!size) {
    return '0 KB';
  }

  if (size >= 1024 * 1024) {
    return `${(
      size /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  }

  return `${(
    size /
    1024
  ).toFixed(2)} KB`;
};

// =====================================================
// MAP BACKEND DOCUMENT → ADMIN UI
// =====================================================
//
// Không tạo mock data.
// Chỉ chuyển dữ liệu Backend sang structure
// mà giao diện Admin hiện tại đang sử dụng.
//
// =====================================================

const mapAdminDocument = (doc) => {
  const uploader =
    doc.uploader ||
    doc.user ||
    {};

  return {
    id:
      doc.id ||
      doc.document_id ||
      '',

    title:
      doc.title ||
      'Untitled Document',

    description:
      doc.description ||
      '',

    fileType:
      doc.file_type ||
      doc.fileType ||
      '',

    fileSize:
      formatFileSize(
        doc.file_size ??
        doc.fileSize
      ),

    fileUrl:
      doc.file_url ||
      doc.fileUrl ||
      '',

    categoryId:
      doc.category_id ||
      doc.categoryId ||
      doc.category?.id ||
      null,

    category:
      doc.category_title ||
      doc.categoryTitle ||
      doc.category_name ||
      doc.categoryName ||
      doc.category?.title ||
      doc.category?.name ||
      'Uncategorized',

    createdAt:
      doc.created_at ||
      doc.createdAt ||
      '',

    updatedAt:
      doc.updated_at ||
      doc.updatedAt ||
      '',

    status: String(
      doc.status ||
      'pending'
    )
      .trim()
      .toLowerCase(),

    downloads:
      Number(
        doc.download_count ??
        doc.downloads ??
        0
      ) || 0,

    views:
      Number(
        doc.view_count ??
        doc.views ??
        0
      ) || 0,

    reviewCount:
      Number(
        doc.review_count ??
        doc.reviewCount ??
        0
      ) || 0,

    averageRating:
      Number(
        doc.average_rating ??
        doc.averageRating ??
        0
      ) || 0,

    uploader: {
      id:
        doc.uploader_id ||
        doc.user_id ||
        uploader.id ||
        null,

      name:
        doc.uploader_name ||
        doc.uploader_full_name ||
        doc.full_name ||
        uploader.full_name ||
        uploader.fullName ||
        uploader.name ||
        'Unknown User',

      email:
        doc.uploader_email ||
        doc.user_email ||
        uploader.email ||
        '',
    },
  };
};

// =====================================================
// ADMIN DOCUMENTS
// =====================================================

export const Documents = () => {
  // ===================================================
  // DOCUMENT DATA
  // ===================================================

  const [
    documents,
    setDocuments,
  ] = useState([]);

  const [
    isLoadingDocuments,
    setIsLoadingDocuments,
  ] = useState(true);

  const [
    documentsError,
    setDocumentsError,
  ] = useState('');

  // ===================================================
  // FILTER
  // ===================================================

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    statusFilter,
    setStatusFilter,
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
  // MODALS
  // ===================================================

  const [
    previewDoc,
    setPreviewDoc,
  ] = useState(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  // ===================================================
  // ACTION STATE
  // ===================================================

  const [
    updatingStatusId,
    setUpdatingStatusId,
  ] = useState(null);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    actionError,
    setActionError,
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  // ===================================================
  // GET /admin/documents
  // ===================================================

  const loadAdminDocuments =
    useCallback(async () => {
      setIsLoadingDocuments(true);
      setDocumentsError('');

      try {
        const response =
          await getAdminDocumentsApi();

        // Hỗ trợ các wrapper response thường gặp:
        //
        // {
        //   documents: [...]
        // }
        //
        // hoặc:
        //
        // {
        //   data: {
        //     documents: [...]
        //   }
        // }
        //
        // hoặc:
        //
        // {
        //   data: [...]
        // }
        const backendDocuments =
          response?.documents ||
          response?.data?.documents ||
          (
            Array.isArray(
              response?.data
            )
              ? response.data
              : []
          );

        const mappedDocuments =
          Array.isArray(
            backendDocuments
          )
            ? backendDocuments.map(
              mapAdminDocument
            )
            : [];

        setDocuments(
          mappedDocuments
        );
      } catch (error) {
        console.error(
          'Admin Documents API error:',
          error
        );

        setDocuments([]);

        setDocumentsError(
          error.response
            ?.data
            ?.message ||
          'Unable to load admin documents.'
        );
      } finally {
        setIsLoadingDocuments(
          false
        );
      }
    }, []);

  useEffect(() => {
    loadAdminDocuments();
  }, [loadAdminDocuments]);

  // ===================================================
  // SEARCH + STATUS FILTER
  // ===================================================

  const filteredDocs =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return documents.filter(
        (doc) => {
          const title =
            String(
              doc.title || ''
            ).toLowerCase();

          const uploaderName =
            String(
              doc.uploader?.name ||
              ''
            ).toLowerCase();

          const uploaderEmail =
            String(
              doc.uploader?.email ||
              ''
            ).toLowerCase();

          const matchesSearch =
            !keyword ||
            title.includes(
              keyword
            ) ||
            uploaderName.includes(
              keyword
            ) ||
            uploaderEmail.includes(
              keyword
            );

          const matchesStatus =
            statusFilter ===
            'all' ||
            doc.status ===
            statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      documents,
      search,
      statusFilter,
    ]);

  // ===================================================
  // PAGINATED DATA
  // ===================================================

  const paginatedDocs =
    useMemo(() => {
      const startIndex =
        (
          currentPage - 1
        ) * itemsPerPage;

      return filteredDocs.slice(
        startIndex,
        startIndex +
        itemsPerPage
      );
    }, [
      filteredDocs,
      currentPage,
    ]);

  const totalPages =
    Math.ceil(
      filteredDocs.length /
      itemsPerPage
    ) || 1;

  // Khi filter/delete làm giảm số page,
  // không để currentPage nằm ngoài range.
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
  // PATCH STATUS
  // ===================================================
  //
  // PATCH /admin/documents/:documentId/status
  //
  // {
  //   status: "approved"
  // }
  //
  // hoặc:
  //
  // {
  //   status: "rejected"
  // }
  //
  // ===================================================

  const handleStatusChange =
    async (
      documentId,
      status
    ) => {
      if (
        !documentId ||
        updatingStatusId
      ) {
        return;
      }

      setUpdatingStatusId(
        documentId
      );

      setActionError('');

      try {
        const response =
          await updateAdminDocumentStatusApi(
            documentId,
            status
          );

        // Mutation thành công
        // → luôn GET lại dữ liệu thật từ Backend.
        await loadAdminDocuments();

        // Nếu preview đang mở document vừa đổi status,
        // update status trong modal để UI không stale.
        setPreviewDoc(
          (prev) => {
            if (
              prev?.id !==
              documentId
            ) {
              return prev;
            }

            return {
              ...prev,
              status,
            };
          }
        );

        let fallbackMessage =
          'Document status updated successfully!';

        if (
          status ===
          'approved'
        ) {
          fallbackMessage =
            'Document approved successfully!';
        }

        if (
          status ===
          'rejected'
        ) {
          fallbackMessage =
            'Document rejected successfully!';
        }

        showSuccessMessage(
          response?.message ||
          fallbackMessage
        );
      } catch (error) {
        console.error(
          'Admin Document Status API error:',
          error
        );

        setActionError(
          error.response
            ?.data
            ?.message ||
          'Unable to update document status.'
        );
      } finally {
        setUpdatingStatusId(
          null
        );
      }
    };

  // ===================================================
  // APPROVE
  // ===================================================

  const handleApprove =
    (documentId) => {
      handleStatusChange(
        documentId,
        'approved'
      );
    };

  // ===================================================
  // REJECT
  // ===================================================

  const handleReject =
    (documentId) => {
      handleStatusChange(
        documentId,
        'rejected'
      );
    };

  // ===================================================
  // DELETE
  // ===================================================
  //
  // DELETE /admin/documents/:documentId
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
      setActionError('');

      try {
        const response =
          await deleteAdminDocumentApi(
            deleteTarget.id
          );

        // Lấy lại dữ liệu thật
        // sau khi Backend DELETE thành công.
        await loadAdminDocuments();

        // Nếu document đang preview cũng chính là
        // document vừa xóa thì đóng Preview.
        if (
          previewDoc?.id ===
          deleteTarget.id
        ) {
          setPreviewDoc(null);
        }

        setDeleteTarget(null);

        showSuccessMessage(
          response?.message ||
          'Document deleted successfully!'
        );
      } catch (error) {
        console.error(
          'Admin Delete Document API error:',
          error
        );

        setActionError(
          error.response
            ?.data
            ?.message ||
          'Unable to delete document.'
        );
      } finally {
        setIsDeleting(false);
      }
    };

  // ===================================================
  // TABLE COLUMNS
  // ===================================================

  const columns = [
    {
      header: 'Document',
    },
    {
      header: 'Uploader',
    },
    {
      header: 'Category',
    },
    {
      header: 'Upload Date',
    },
    {
      header: 'Status',
    },
    {
      header: 'Actions',
      style: {
        textAlign: 'right',
      },
    },
  ];

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="admin-page-content">

      {/* =================================================
          FILTER BAR
      ================================================= */}

      <div className="admin-filter-bar">
        <div className="admin-filter-group">

          <Input
            placeholder="Search document title or uploader..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(
                e.target.value
              );

              setCurrentPage(1);
            }}
            options={[
              {
                label:
                  'Tất cả trạng thái',
                value: 'all',
              },
              {
                label:
                  'Chờ duyệt (Pending)',
                value:
                  'pending',
              },
              {
                label:
                  'Đã duyệt (Approved)',
                value:
                  'approved',
              },
              {
                label:
                  'Từ chối (Rejected)',
                value:
                  'rejected',
              },
            ]}
            className="admin-filter-select"
          />

        </div>
      </div>

      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

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

          {successMessage}
        </div>
      )}

      {/* =================================================
          ACTION ERROR
      ================================================= */}

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

          {actionError}
        </div>
      )}

      {/* =================================================
          LOAD ERROR
      ================================================= */}

      {documentsError && (
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

          {documentsError}
        </div>
      )}

      {/* =================================================
          DOCUMENT TABLE
      ================================================= */}

      {isLoadingDocuments ? (
        <div className="payt-card">
          Loading documents...
        </div>
      ) : (
        <>
          <AdminTable
            columns={columns}
            data={paginatedDocs}
            emptyMessage="Không tìm thấy tài liệu phù hợp."
            renderRow={(doc) => (
              <tr key={doc.id}>

                {/* DOCUMENT */}

                <td>
                  <div className="admin-cell-doc">

                    <FileText
                      size={20}
                      color="var(--primary-orange)"
                    />

                    <div>
                      <div className="admin-cell-title">
                        {doc.title}
                      </div>

                      <div className="admin-cell-subtitle">
                        {(
                          doc.fileType ||
                          'UNKNOWN'
                        ).toUpperCase()}
                        {' • '}
                        {doc.fileSize}
                      </div>
                    </div>

                  </div>
                </td>

                {/* UPLOADER */}

                <td>
                  <div className="admin-cell-title">
                    {
                      doc.uploader
                        .name
                    }
                  </div>

                  <div className="admin-cell-subtitle">
                    {
                      doc.uploader
                        .email ||
                      '—'
                    }
                  </div>
                </td>

                {/* CATEGORY */}

                <td>
                  {doc.category}
                </td>

                {/* DATE */}

                <td>
                  {
                    doc.createdAt
                      ? new Date(
                        doc.createdAt
                      )
                        .toLocaleDateString(
                          'vi-VN'
                        )
                      : '—'
                  }
                </td>

                {/* STATUS */}

                <td>
                  <StatusBadge
                    value={
                      doc.status
                    }
                  />
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

                    {/* VIEW */}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPreviewDoc(
                          doc
                        )
                      }
                      icon={Eye}
                    >
                      View
                    </Button>

                    {/* APPROVE */}

                    {doc.status !==
                      'approved' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            handleApprove(
                              doc.id
                            )
                          }
                          icon={
                            CheckCircle
                          }
                          disabled={
                            updatingStatusId ===
                            doc.id
                          }
                        >
                          {
                            updatingStatusId ===
                              doc.id
                              ? 'Updating...'
                              : 'Approve'
                          }
                        </Button>
                      )}

                    {/* REJECT */}

                    {doc.status !==
                      'rejected' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            handleReject(
                              doc.id
                            )
                          }
                          icon={
                            XCircle
                          }
                          disabled={
                            updatingStatusId ===
                            doc.id
                          }
                        >
                          {
                            updatingStatusId ===
                              doc.id
                              ? 'Updating...'
                              : 'Reject'
                          }
                        </Button>
                      )}

                    {/* DELETE */}

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        setDeleteTarget(
                          doc
                        )
                      }
                      icon={Trash2}
                      disabled={
                        updatingStatusId ===
                        doc.id ||
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

          {/* =============================================
              PAGINATION
          ============================================= */}

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

      {/* =================================================
          PREVIEW MODAL
      ================================================= */}

      {previewDoc && (
        <Modal
          isOpen={
            !!previewDoc
          }
          onClose={() =>
            setPreviewDoc(null)
          }
          title="Document Details Preview"
          size="md"
          footer={
            <Button
              variant="secondary"
              onClick={() =>
                setPreviewDoc(
                  null
                )
              }
            >
              Close
            </Button>
          }
        >
          <div
            style={{
              display: 'flex',
              flexDirection:
                'column',
              gap: '12px',
            }}
          >

            <div>
              <strong>
                Title:
              </strong>

              <p
                style={{
                  margin:
                    '4px 0 0',
                }}
              >
                {
                  previewDoc
                    .title
                }
              </p>
            </div>

            <div
              style={{
                display:
                  'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap:
                  '12px',
              }}
            >

              <div>
                <strong>
                  Uploader:
                </strong>{' '}

                {
                  previewDoc
                    .uploader
                    .name
                }
              </div>

              <div>
                <strong>
                  Email:
                </strong>{' '}

                {
                  previewDoc
                    .uploader
                    .email ||
                  '—'
                }
              </div>

              <div>
                <strong>
                  Category:
                </strong>{' '}

                {
                  previewDoc
                    .category
                }
              </div>

              <div>
                <strong>
                  Status:
                </strong>{' '}

                <StatusBadge
                  value={
                    previewDoc
                      .status
                  }
                />
              </div>

              <div>
                <strong>
                  File Format:
                </strong>{' '}

                {(
                  previewDoc
                    .fileType ||
                  'UNKNOWN'
                ).toUpperCase()}
              </div>

              <div>
                <strong>
                  Downloads:
                </strong>{' '}

                {
                  previewDoc
                    .downloads
                }
              </div>

              <div>
                <strong>
                  Views:
                </strong>{' '}

                {
                  previewDoc
                    .views
                }
              </div>

              <div>
                <strong>
                  Reviews:
                </strong>{' '}

                {
                  previewDoc
                    .reviewCount
                }
              </div>

            </div>

            {previewDoc.description && (
              <div>
                <strong>
                  Description:
                </strong>

                <p
                  style={{
                    margin:
                      '4px 0 0',
                  }}
                >
                  {
                    previewDoc
                      .description
                  }
                </p>
              </div>
            )}

          </div>
        </Modal>
      )}

      {/* =================================================
          DELETE CONFIRMATION
      ================================================= */}

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
        title="Xóa tài liệu"
        message={
          `Bạn có chắc chắn muốn xóa tài liệu "${deleteTarget?.title || ''}" không? Hành động này sẽ xóa tài liệu thật khỏi hệ thống.`
        }
        confirmText={
          isDeleting
            ? 'Đang xóa...'
            : 'Xóa tài liệu'
        }
      />

    </div>
  );
};

export default Documents;