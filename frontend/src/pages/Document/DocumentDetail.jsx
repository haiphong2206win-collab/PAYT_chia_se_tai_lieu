import {
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  useParams,
  Link,
} from 'react-router-dom';

import {
  ArrowLeft,
  Download,
  Bookmark,
  BookmarkCheck,
  Star,
  Calendar,
  Share2,
  FileText,
  MessageSquare,
  Edit3,
  Trash2,
} from 'lucide-react';

import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import DocumentPreview from '../../components/document/DocumentPreview';
import DocumentCard from '../../components/document/DocumentCard';

// =====================================================
// DOCUMENT API
// =====================================================

import {
  getDocumentByIdApi,
  getDocumentsApi,
  downloadDocumentApi,
  getDocumentSaveStatusApi,
  saveDocumentApi,
  unsaveDocumentApi,

  // REVIEWS
  getDocumentReviewsApi,
  createDocumentReviewApi,
  updateReviewApi,
  deleteReviewApi,
} from '../../services/document.api';

// =====================================================
// USER API
// =====================================================

import {
  getUserProfileApi,
} from '../../services/user.api';

import {
  formatDate,
} from '../../utils/formatters';

import './DocumentDetail.css';

// =====================================================
// HELPER: EXTRACT SAVED STATUS
// =====================================================

const extractSavedStatus = (response) => {
  if (
    typeof response?.isSaved ===
    'boolean'
  ) {
    return response.isSaved;
  }

  if (
    typeof response?.saved ===
    'boolean'
  ) {
    return response.saved;
  }

  if (
    typeof response?.data ===
    'boolean'
  ) {
    return response.data;
  }

  if (
    typeof response?.data?.isSaved ===
    'boolean'
  ) {
    return response.data.isSaved;
  }

  if (
    typeof response?.data?.saved ===
    'boolean'
  ) {
    return response.data.saved;
  }

  if (
    response?.data?.id ||
    response?.data?.document_id ||
    response?.data?.documentId
  ) {
    return true;
  }

  return false;
};

// =====================================================
// HELPER: MAP BACKEND REVIEW → UI REVIEW
// =====================================================

const mapBackendReview = (review) => ({
  id:
    review.id ||
    review.review_id,

  rating:
    Number(
      review.rating ??
      review.star ??
      review.stars ??
      0
    ),

  content:
    review.comment ??
    review.content ??
    review.review ??
    review.description ??
    '',

  createdAt:
    review.created_at ||
    review.createdAt,

  updatedAt:
    review.updated_at ||
    review.updatedAt,

  user: {
    id:
      review.user_id ||
      review.reviewer_id ||
      review.user?.id ||
      review.reviewer?.id ||
      null,

    name:
      review.reviewer_name ||
      review.user_name ||
      review.user_full_name ||
      review.reviewer_full_name ||
      review.full_name ||
      review.user?.full_name ||
      review.user?.fullName ||
      review.user?.name ||
      review.reviewer?.full_name ||
      review.reviewer?.name ||
      'Anonymous User',

    avatar:
      review.reviewer_avatar ||
      review.user_avatar ||
      review.avatar ||
      review.user?.avatar ||
      review.reviewer?.avatar ||
      'https://ui-avatars.com/api/?name=User',
  },
});

// =====================================================
// HELPER: FORMAT FILE SIZE
// =====================================================
//
// GET /documents trả file_size bằng bytes.
// DocumentCard của UI đang hiển thị dạng KB / MB,
// vì vậy map về đúng format trước khi render.
//
// =====================================================

const formatRelatedFileSize = (bytes) => {
  const size =
    Number(bytes || 0);

  if (!size) {
    return '0 KB';
  }

  if (
    size >=
    1024 * 1024
  ) {
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
// HELPER: FORMAT FILE TYPE
// =====================================================
//
// Ví dụ Backend:
// application/pdf
//
// UI:
// PDF
//
// =====================================================

const formatRelatedFileType = (
  fileType
) => {
  if (!fileType) {
    return 'FILE';
  }

  return fileType
    .split('/')
    .pop()
    .toUpperCase();
};

// =====================================================
// HELPER: MAP BACKEND DOCUMENT → DOCUMENT CARD
// =====================================================
//
// Related Documents dùng lại component DocumentCard.
//
// Vì Backend dùng snake_case còn DocumentCard đang dùng
// object theo format UI cũ nên cần map trước:
//
// Backend              UI
// category_title   →   major
// category_id      →   categoryId
// file_type        →   fileType
// file_size        →   fileSize
// created_at       →   uploadDate
// download_count   →   downloads
// view_count       →   views
// average_rating   →   rating
// review_count     →   reviewCount
//
// Không tạo dữ liệu giả cho Subject vì Backend hiện
// chưa có field Subject tương ứng.
//
// =====================================================

const mapBackendRelatedDocument = (
  doc
) => ({
  id:
    doc.id,

  title:
    doc.title ||
    'Untitled Document',

  description:
    doc.description ||
    '',

  // UI cũ gọi field này là major,
  // nhưng dữ liệu thật hiện tại là Category.
  major:
    doc.category_title ||
    doc.category_name ||
    'Uncategorized',

  majorSlug:
    doc.category_slug ||
    doc.category_title ||
    '',

  categoryId:
    doc.category_id,

  // Backend chưa có Subject.
  subject: '',

  fileType:
    formatRelatedFileType(
      doc.file_type
    ),

  rawFileType:
    doc.file_type,

  fileSize:
    formatRelatedFileSize(
      doc.file_size
    ),

  fileUrl:
    doc.file_url,

  uploadDate:
    doc.created_at,

  downloads:
    Number(
      doc.download_count
    ) || 0,

  views:
    Number(
      doc.view_count
    ) || 0,

  rating:
    Number(
      doc.average_rating
    ) || 0,

  reviewCount:
    Number(
      doc.review_count
    ) || 0,

  status:
    doc.status,

  uploader: {
    id:
      doc.uploader_id ||
      null,

    name:
      doc.uploader_name ||
      doc.full_name ||
      'Unknown User',

    avatar:
      doc.uploader_avatar ||
      'https://ui-avatars.com/api/?name=User',
  },
});

// =====================================================
// DOCUMENT DETAIL COMPONENT
// =====================================================

export const DocumentDetail = () => {
  const { id } = useParams();

  // =====================================================
  // 1. DOCUMENT STATE
  // =====================================================

  const [
    document,
    setDocument,
  ] = useState(null);

  const [
    isLoadingDocument,
    setIsLoadingDocument,
  ] = useState(true);

  const [
    documentError,
    setDocumentError,
  ] = useState('');

  // =====================================================
  // RELATED DOCUMENTS STATE
  // =====================================================
  //
  // Không dùng MOCK_DOCUMENTS nữa.
  //
  // Related Documents sẽ được lấy từ:
  //
  // GET /documents
  //
  // với categoryId của document hiện tại.
  //
  // =====================================================

  const [
    relatedDocs,
    setRelatedDocs,
  ] = useState([]);

  const [
    isLoadingRelatedDocs,
    setIsLoadingRelatedDocs,
  ] = useState(false);

  const [
    relatedDocsError,
    setRelatedDocsError,
  ] = useState('');

  // =====================================================
  // 2. DOWNLOAD STATE
  // =====================================================

  const [
    downloadCount,
    setDownloadCount,
  ] = useState(0);

  const [
    isDownloading,
    setIsDownloading,
  ] = useState(false);

  // =====================================================
  // 3. SAVE DOCUMENT STATE
  // =====================================================

  const [
    isSaved,
    setIsSaved,
  ] = useState(false);

  const [
    isCheckingSaved,
    setIsCheckingSaved,
  ] = useState(true);

  const [
    isSavingLibrary,
    setIsSavingLibrary,
  ] = useState(false);

  // =====================================================
  // 4. REVIEWS STATE
  // =====================================================

  const [
    reviews,
    setReviews,
  ] = useState([]);

  const [
    isLoadingReviews,
    setIsLoadingReviews,
  ] = useState(true);

  const [
    reviewsError,
    setReviewsError,
  ] = useState('');

  const [
    reviewTotalCount,
    setReviewTotalCount,
  ] = useState(0);

  // =====================================================
  // 5. CURRENT USER STATE
  // =====================================================
  //
  // Dùng để xác định review nào là của user
  // đang đăng nhập.
  //
  // Chỉ review của chính mình mới có:
  // Edit
  // Delete
  //
  // =====================================================

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState(null);

  const [
    isLoadingCurrentUser,
    setIsLoadingCurrentUser,
  ] = useState(true);

  // =====================================================
  // 6. CREATE REVIEW STATE
  // =====================================================

  const [
    reviewRating,
    setReviewRating,
  ] = useState(0);

  const [
    reviewComment,
    setReviewComment,
  ] = useState('');

  const [
    isSubmittingReview,
    setIsSubmittingReview,
  ] = useState(false);

  const [
    reviewSubmitError,
    setReviewSubmitError,
  ] = useState('');

  // =====================================================
  // 7. EDIT REVIEW STATE
  // =====================================================

  const [
    editingReviewId,
    setEditingReviewId,
  ] = useState(null);

  const [
    editRating,
    setEditRating,
  ] = useState(0);

  const [
    editComment,
    setEditComment,
  ] = useState('');

  const [
    isUpdatingReview,
    setIsUpdatingReview,
  ] = useState(false);

  const [
    reviewActionError,
    setReviewActionError,
  ] = useState('');

  // =====================================================
  // 8. DELETE REVIEW STATE
  // =====================================================

  const [
    deletingReviewId,
    setDeletingReviewId,
  ] = useState(null);

  // =====================================================
  // 9. TOAST STATE
  // =====================================================

  const [
    toastMessage,
    setToastMessage,
  ] = useState('');

  const [
    toastType,
    setToastType,
  ] = useState('success');

  // =====================================================
  // 10. SHOW TOAST
  // =====================================================

  const showToast = (
    message,
    type = 'success'
  ) => {
    setToastMessage(message);
    setToastType(type);
  };

  // =====================================================
  // 11. LOAD DOCUMENT DETAIL
  // =====================================================
  //
  // GET /documents/:documentId
  //
  // showLoading = true:
  // dùng khi lần đầu mở trang.
  //
  // showLoading = false:
  // dùng sau POST/PATCH/DELETE review
  // để refresh rating/count mà không làm
  // cả trang nhảy về Loading.
  //
  // =====================================================

  const loadDocumentDetail =
    useCallback(
      async (
        showLoading = true
      ) => {
        if (!id) {
          return;
        }

        if (showLoading) {
          setIsLoadingDocument(
            true
          );
        }

        setDocumentError('');

        try {
          const response =
            await getDocumentByIdApi(
              id
            );

          console.log(
            'Document Detail API response:',
            response
          );

          const backendDocument =
            response.document ||
            response.data ||
            response;

          const mappedDocument = {
            id:
              backendDocument.id,

            title:
              backendDocument.title ||
              'Untitled Document',

            description:
              backendDocument.description ||
              'No description available.',

            major:
              backendDocument.category_title ||
              'Uncategorized',

            categoryId:
              backendDocument.category_id,

            // Backend hiện chưa có Subject tương ứng.
            subject:
              backendDocument.subject ||
              '',

            fileType:
              backendDocument.file_type
                ? backendDocument
                  .file_type
                  .split('/')
                  .pop()
                  .toUpperCase()
                : 'FILE',

            rawFileType:
              backendDocument.file_type,

            fileUrl:
              backendDocument.file_url,

            fileSize:
              backendDocument.file_size
                ? backendDocument.file_size >=
                  1024 * 1024
                  ? `${(
                    backendDocument.file_size /
                    (1024 * 1024)
                  ).toFixed(2)} MB`
                  : `${(
                    backendDocument.file_size /
                    1024
                  ).toFixed(2)} KB`
                : 'Unknown',

            uploadDate:
              backendDocument.created_at,

            downloads:
              Number(
                backendDocument.download_count ??
                0
              ),

            views:
              Number(
                backendDocument.view_count ??
                0
              ),

            rating:
              Number(
                backendDocument.average_rating ??
                0
              ),

            reviewCount:
              Number(
                backendDocument.review_count ??
                0
              ),

            status:
              backendDocument.status ||
              'pending',

            pages:
              backendDocument.pages ||
              null,

            uploader: {
              id:
                backendDocument.uploader_id ||
                null,

              name:
                backendDocument.uploader_name ||
                backendDocument.full_name ||
                'Unknown User',

              avatar:
                backendDocument.uploader_avatar ||
                'https://ui-avatars.com/api/?name=User',

              role:
                backendDocument.uploader_role ||
                'Student',
            },
          };

          setDocument(
            mappedDocument
          );

          setDownloadCount(
            mappedDocument.downloads
          );
        } catch (error) {
          console.error(
            'Document Detail API error:',
            error
          );

          setDocumentError(
            error.response
              ?.data
              ?.message ||
            'Unable to load document.'
          );
        } finally {
          if (showLoading) {
            setIsLoadingDocument(
              false
            );
          }
        }
      },
      [id]
    );

  // =====================================================
  // LOAD DOCUMENT KHI MỞ TRANG
  // =====================================================

  useEffect(() => {
    loadDocumentDetail();
  }, [loadDocumentDetail]);

  // =====================================================
  // 11A. LOAD RELATED DOCUMENTS
  // =====================================================
  //
  // Luồng:
  //
  // Document Detail
  // ↓
  // lấy categoryId của document hiện tại
  // ↓
  // GET /documents
  //
  // Query:
  // {
  //   categoryId,
  //   page: 1,
  //   limit: 4,
  //   sortBy: 'created_at',
  //   order: 'DESC'
  // }
  // ↓
  // loại document đang xem
  // ↓
  // lấy tối đa 3 document
  // ↓
  // render DocumentCard
  //
  // Tại sao limit = 4?
  //
  // Nếu chính document hiện tại cũng xuất hiện trong
  // GET /documents thì sau khi loại nó ra vẫn còn tối đa
  // 3 tài liệu để hiển thị.
  //
  // Lưu ý:
  // GET /documents hiện có thể chỉ trả document approved.
  // Nếu category chưa có tài liệu approved khác,
  // Related Documents sẽ hiển thị Empty State.
  //
  // =====================================================

  const loadRelatedDocuments =
    useCallback(
      async () => {
        // Chỉ gọi khi Detail đã load xong
        // và đã có categoryId thật.
        if (
          !id ||
          !document?.categoryId
        ) {
          setRelatedDocs([]);
          setRelatedDocsError('');
          return;
        }

        setIsLoadingRelatedDocs(
          true
        );

        setRelatedDocsError('');

        try {
          const query = {
            categoryId:
              document.categoryId,

            page:
              1,

            limit:
              4,

            sortBy:
              'created_at',

            order:
              'DESC',
          };

          console.log(
            'Related Documents query:',
            query
          );

          // =============================================
          // GET /documents?categoryId=...
          // =============================================

          const response =
            await getDocumentsApi(
              query
            );

          console.log(
            'Related Documents API response:',
            response
          );

          const backendDocuments =
            response.documents ||
            response.data?.documents ||
            (
              Array.isArray(
                response.data
              )
                ? response.data
                : []
            );

          // =============================================
          // 1. Loại document đang xem.
          // 2. Map Backend → UI.
          // 3. Chỉ lấy tối đa 3 tài liệu.
          // =============================================

          const mappedRelatedDocs =
            backendDocuments
              .filter(
                (doc) =>
                  String(
                    doc.id
                  ) !==
                  String(
                    id
                  )
              )
              .map(
                mapBackendRelatedDocument
              )
              .slice(
                0,
                3
              );

          console.log(
            'Mapped Related Documents for UI:',
            mappedRelatedDocs
          );

          setRelatedDocs(
            mappedRelatedDocs
          );
        } catch (error) {
          console.error(
            'Related Documents API error:',
            error
          );

          setRelatedDocs([]);

          setRelatedDocsError(
            error.response
              ?.data
              ?.message ||
            'Unable to load related documents.'
          );
        } finally {
          setIsLoadingRelatedDocs(
            false
          );
        }
      },
      [
        id,
        document?.categoryId,
      ]
    );

  // Khi document hiện tại thay đổi
  // hoặc categoryId thay đổi
  // → load lại Related Documents.

  useEffect(() => {
    loadRelatedDocuments();
  }, [loadRelatedDocuments]);

  // =====================================================
  // 12. LOAD REVIEWS
  // =====================================================
  //
  // GET /documents/:documentId/reviews
  //
  // =====================================================

  const loadReviews =
    useCallback(
      async (
        showLoading = true
      ) => {
        if (!id) {
          return;
        }

        if (showLoading) {
          setIsLoadingReviews(
            true
          );
        }

        setReviewsError('');

        try {
          const response =
            await getDocumentReviewsApi(
              id
            );

          console.log(
            'Document Reviews API response:',
            response
          );

          const backendReviews =
            response.reviews ||
            response.data?.reviews ||
            (
              Array.isArray(
                response.data
              )
                ? response.data
                : []
            );

          const mappedReviews =
            backendReviews.map(
              mapBackendReview
            );

          console.log(
            'Mapped Reviews for UI:',
            mappedReviews
          );

          setReviews(
            mappedReviews
          );

          // ===========================================
          // Backend có pagination.
          //
          // Nếu có totalCount:
          // dùng tổng thật từ Backend.
          //
          // Nếu không:
          // dùng số review hiện có.
          // ===========================================

          setReviewTotalCount(
            Number(
              response.pagination
                ?.totalCount ??
              response.data
                ?.pagination
                ?.totalCount ??
              mappedReviews.length
            )
          );
        } catch (error) {
          console.error(
            'Document Reviews API error:',
            error
          );

          setReviews([]);

          setReviewTotalCount(
            0
          );

          setReviewsError(
            error.response
              ?.data
              ?.message ||
            'Unable to load reviews.'
          );
        } finally {
          if (showLoading) {
            setIsLoadingReviews(
              false
            );
          }
        }
      },
      [id]
    );

  // =====================================================
  // LOAD REVIEWS KHI MỞ TRANG
  // =====================================================

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // =====================================================
  // 13. GET CURRENT USER
  // =====================================================
  //
  // GET /users/profile
  //
  // =====================================================

  useEffect(() => {
    const loadCurrentUser =
      async () => {
        setIsLoadingCurrentUser(
          true
        );

        try {
          const response =
            await getUserProfileApi();

          console.log(
            'Current User API response:',
            response
          );

          const profile =
            response.user ||
            response.data ||
            response;

          setCurrentUserId(
            profile.id ||
            profile.user_id ||
            null
          );
        } catch (error) {
          console.error(
            'Current User API error:',
            error
          );

          setCurrentUserId(
            null
          );
        } finally {
          setIsLoadingCurrentUser(
            false
          );
        }
      };

    loadCurrentUser();
  }, []);

  // =====================================================
  // 14. CHECK SAVED STATUS
  // =====================================================
  //
  // GET /documents/:documentId/save
  //
  // =====================================================

  useEffect(() => {
    const checkSavedStatus =
      async () => {
        if (!id) {
          return;
        }

        setIsCheckingSaved(
          true
        );

        try {
          const response =
            await getDocumentSaveStatusApi(
              id
            );

          console.log(
            'Document Save Status API response:',
            response
          );

          setIsSaved(
            extractSavedStatus(
              response
            )
          );
        } catch (error) {
          if (
            error.response?.status ===
            404
          ) {
            setIsSaved(false);
          } else {
            console.error(
              'Document Save Status API error:',
              error
            );

            setIsSaved(false);
          }
        } finally {
          setIsCheckingSaved(
            false
          );
        }
      };

    checkSavedStatus();
  }, [id]);

  // =====================================================
  // 15. DOWNLOAD DOCUMENT
  // =====================================================
  //
  // GET /documents/:documentId/download
  //
  // =====================================================

  const handleDownloadClick =
    async () => {
      if (
        isDownloading ||
        !document
      ) {
        return;
      }

      setIsDownloading(true);

      try {
        const response =
          await downloadDocumentApi(
            document.id
          );

        console.log(
          'Download Document API response:',
          response
        );

        const contentType =
          response.headers?.[
          'content-type'
          ] || '';

        // =============================================
        // CASE 1:
        // Backend trả JSON có fileUrl
        // =============================================

        if (
          contentType.includes(
            'application/json'
          )
        ) {
          const text =
            await response.data.text();

          const json =
            JSON.parse(text);

          console.log(
            'Download JSON response:',
            json
          );

          const downloadUrl =
            json.url ||
            json.fileUrl ||
            json.file_url ||
            json.data?.url ||
            json.data?.fileUrl ||
            json.data?.file_url;

          if (!downloadUrl) {
            throw new Error(
              'Backend did not return a download URL.'
            );
          }

          const link =
            window.document
              .createElement('a');

          link.href =
            downloadUrl;

          link.target =
            '_blank';

          link.rel =
            'noopener noreferrer';

          window.document.body
            .appendChild(link);

          link.click();

          link.remove();
        }

        // =============================================
        // CASE 2:
        // Backend trả file trực tiếp
        // =============================================

        else {
          const blobUrl =
            URL.createObjectURL(
              response.data
            );

          const link =
            window.document
              .createElement('a');

          link.href =
            blobUrl;

          const extension =
            document.fileType
              ?.toLowerCase() ||
            'file';

          link.download =
            `${document.title}.${extension}`;

          window.document.body
            .appendChild(link);

          link.click();

          link.remove();

          URL.revokeObjectURL(
            blobUrl
          );
        }

        setDownloadCount(
          (prev) =>
            prev + 1
        );

        showToast(
          'Document downloaded successfully!',
          'success'
        );
      } catch (error) {
        console.error(
          'Download Document API error:',
          error
        );

        showToast(
          error.response
            ?.data
            ?.message ||
          error.message ||
          'Unable to download document.',
          'error'
        );
      } finally {
        setIsDownloading(
          false
        );
      }
    };

  // =====================================================
  // 16. SAVE / UNSAVE DOCUMENT
  // =====================================================

  const handleSaveLibrary =
    async () => {
      if (
        isSavingLibrary ||
        isCheckingSaved ||
        !document
      ) {
        return;
      }

      setIsSavingLibrary(
        true
      );

      try {
        // =============================================
        // CHƯA SAVE → SAVE
        // =============================================

        if (!isSaved) {
          const response =
            await saveDocumentApi(
              document.id
            );

          console.log(
            'Save Document API response:',
            response
          );

          setIsSaved(true);

          showToast(
            response.message ||
            'Document saved to your library!',
            'success'
          );
        }

        // =============================================
        // ĐÃ SAVE → UNSAVE
        // =============================================

        else {
          const response =
            await unsaveDocumentApi(
              document.id
            );

          console.log(
            'Unsave Document API response:',
            response
          );

          setIsSaved(false);

          showToast(
            response.message ||
            'Document removed from your library.',
            'info'
          );
        }
      } catch (error) {
        console.error(
          'Save / Unsave Document API error:',
          error
        );

        showToast(
          error.response
            ?.data
            ?.message ||
          'Unable to update saved document.',
          'error'
        );
      } finally {
        setIsSavingLibrary(
          false
        );
      }
    };

  // =====================================================
  // 17. CREATE REVIEW
  // =====================================================
  //
  // POST /documents/:documentId/reviews
  //
  // Body đã test:
  //
  // {
  //   rating: 5,
  //   comment: "..."
  // }
  //
  // =====================================================

  const handleSubmitReview =
    async (e) => {
      e.preventDefault();

      if (
        isSubmittingReview
      ) {
        return;
      }

      if (!currentUserId) {
        setReviewSubmitError(
          'Please log in before submitting a review.'
        );

        return;
      }

      // ===============================================
      // RATING 1 → 5
      // ===============================================

      if (
        reviewRating < 1 ||
        reviewRating > 5
      ) {
        setReviewSubmitError(
          'Please select a rating from 1 to 5 stars.'
        );

        return;
      }

      setIsSubmittingReview(
        true
      );

      setReviewSubmitError('');

      try {
        const reviewData = {
          rating:
            reviewRating,

          comment:
            reviewComment.trim(),
        };

        console.log(
          'Create Review payload:',
          reviewData
        );

        const response =
          await createDocumentReviewApi(
            id,
            reviewData
          );

        console.log(
          'Create Review API response:',
          response
        );

        setReviewRating(0);
        setReviewComment('');

        showToast(
          response.message ||
          'Review submitted successfully!',
          'success'
        );

        // =============================================
        // REFRESH:
        //
        // Reviews
        // Average Rating
        // Review Count
        // =============================================

        await Promise.all([
          loadReviews(false),

          loadDocumentDetail(
            false
          ),
        ]);
      } catch (error) {
        console.error(
          'Create Review API error:',
          error
        );

        setReviewSubmitError(
          error.response
            ?.data
            ?.message ||
          'Unable to submit review.'
        );
      } finally {
        setIsSubmittingReview(
          false
        );
      }
    };

  // =====================================================
  // 18. OPEN EDIT REVIEW
  // =====================================================

  const handleOpenEditReview =
    (review) => {
      setEditingReviewId(
        review.id
      );

      setEditRating(
        review.rating
      );

      setEditComment(
        review.content || ''
      );

      setReviewActionError(
        ''
      );
    };

  // =====================================================
  // 19. CANCEL EDIT REVIEW
  // =====================================================

  const handleCancelEditReview =
    () => {
      if (
        isUpdatingReview
      ) {
        return;
      }

      setEditingReviewId(
        null
      );

      setEditRating(0);

      setEditComment('');

      setReviewActionError('');
    };

  // =====================================================
  // 20. UPDATE REVIEW
  // =====================================================
  //
  // PATCH /reviews/:reviewId
  //
  // =====================================================

  const handleUpdateReview =
    async (e) => {
      e.preventDefault();

      if (
        !editingReviewId ||
        isUpdatingReview
      ) {
        return;
      }

      if (
        editRating < 1 ||
        editRating > 5
      ) {
        setReviewActionError(
          'Please select a rating from 1 to 5 stars.'
        );

        return;
      }

      setIsUpdatingReview(
        true
      );

      setReviewActionError('');

      try {
        const reviewData = {
          rating:
            editRating,

          comment:
            editComment.trim(),
        };

        console.log(
          'Update Review payload:',
          reviewData
        );

        const response =
          await updateReviewApi(
            editingReviewId,
            reviewData
          );

        console.log(
          'Update Review API response:',
          response
        );

        setEditingReviewId(
          null
        );

        setEditRating(0);
        setEditComment('');

        showToast(
          response.message ||
          'Review updated successfully!',
          'success'
        );

        await Promise.all([
          loadReviews(false),

          loadDocumentDetail(
            false
          ),
        ]);
      } catch (error) {
        console.error(
          'Update Review API error:',
          error
        );

        setReviewActionError(
          error.response
            ?.data
            ?.message ||
          'Unable to update review.'
        );
      } finally {
        setIsUpdatingReview(
          false
        );
      }
    };

  // =====================================================
  // 21. DELETE REVIEW
  // =====================================================
  //
  // DELETE /reviews/:reviewId
  //
  // =====================================================

  const handleDeleteReview =
    async (reviewId) => {
      if (
        deletingReviewId
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          'Are you sure you want to delete this review?'
        );

      if (!confirmed) {
        return;
      }

      setDeletingReviewId(
        reviewId
      );

      try {
        const response =
          await deleteReviewApi(
            reviewId
          );

        console.log(
          'Delete Review API response:',
          response
        );

        // Nếu đang edit chính review này
        // thì đóng edit form.
        if (
          editingReviewId ===
          reviewId
        ) {
          setEditingReviewId(
            null
          );

          setEditRating(0);
          setEditComment('');
        }

        showToast(
          response.message ||
          'Review deleted successfully!',
          'success'
        );

        await Promise.all([
          loadReviews(false),

          loadDocumentDetail(
            false
          ),
        ]);
      } catch (error) {
        console.error(
          'Delete Review API error:',
          error
        );

        showToast(
          error.response
            ?.data
            ?.message ||
          'Unable to delete review.',
          'error'
        );
      } finally {
        setDeletingReviewId(
          null
        );
      }
    };

  // =====================================================
  // 22. SHARE DOCUMENT
  // =====================================================

  const handleShareClick =
    () => {
      if (
        navigator.clipboard
      ) {
        navigator.clipboard
          .writeText(
            window.location.href
          )
          .catch(
            () => { }
          );
      }

      showToast(
        'Document link copied to clipboard!',
        'info'
      );
    };

  // =====================================================
  // 23. CHECK REVIEW OWNERSHIP
  // =====================================================

  const isOwnReview =
    (review) => {
      if (
        !currentUserId ||
        !review?.user?.id
      ) {
        return false;
      }

      return (
        String(
          review.user.id
        ) ===
        String(
          currentUserId
        )
      );
    };

  // =====================================================
  // REVIEW HIỆN TẠI CỦA USER
  // =====================================================
  //
  // Nếu user đã review document:
  //
  // Không hiện Write a Review nữa.
  // Thay vào đó user Edit/Delete review cũ.
  //
  // =====================================================

  const myReview =
    currentUserId
      ? reviews.find(
        (review) =>
          isOwnReview(
            review
          )
      )
      : null;

  // =====================================================
  // 24. LOADING DOCUMENT
  // =====================================================

  if (
    isLoadingDocument
  ) {
    return (
      <div className="payt-document-detail-page">

        <div className="container detail-content-container">

          <div className="payt-card">
            Loading document...
          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // 25. DOCUMENT ERROR
  // =====================================================

  if (
    documentError ||
    !document
  ) {
    return (
      <div className="payt-document-detail-page">

        <div className="container detail-content-container">

          <div className="payt-card">

            <h2>
              Unable to load document
            </h2>

            <p>
              {documentError}
            </p>

            <Link
              to="/documents"
            >
              Back to Documents
            </Link>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // 26. UI
  // =====================================================

  return (
    <div className="payt-document-detail-page">

      {/* =================================================
          TOAST
      ================================================= */}

      <Toast
        message={
          toastMessage
        }
        type={
          toastType
        }
        onClose={() =>
          setToastMessage('')
        }
      />

      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <div className="detail-breadcrumb-bar">

        <div className="container breadcrumb-container">

          <Link
            to="/documents"
            className="back-link"
          >

            <ArrowLeft
              size={16}
            />

            Back to Documents

          </Link>

          <div className="breadcrumb-path">

            <Link to="/">
              Home
            </Link>

            {' / '}

            <Link
              to="/documents"
            >
              Documents
            </Link>

            {' / '}

            <span className="current">
              {document.title}
            </span>

          </div>

        </div>

      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="container detail-content-container">

        {/* =================================================
            DOCUMENT HEADER
        ================================================= */}

        <div className="doc-detail-header">

          <div className="header-badges">

            <span className="badge badge-major">
              {document.major}
            </span>

            <span
              className={
                `badge ${document.fileType ===
                  'PDF'
                  ? 'badge-pdf'
                  : 'badge-slides'
                }`
              }
            >
              {document.fileType}
            </span>

            {document.subject && (

              <span className="badge badge-default">
                {document.subject}
              </span>

            )}

          </div>

          <h1 className="detail-doc-title">
            {document.title}
          </h1>

          <div className="detail-uploader-row">

            {/* UPLOADER */}

            <div className="uploader-avatar-box">

              <img
                src={
                  document
                    .uploader
                    .avatar
                }
                alt={
                  document
                    .uploader
                    .name
                }
                className="uploader-avatar"
              />

              <div className="uploader-text">

                <span className="uploader-name">
                  {
                    document
                      .uploader
                      .name
                  }
                </span>

                <span className="uploader-role">
                  {
                    document
                      .uploader
                      .role
                  }
                </span>

              </div>

            </div>

            <div className="uploader-stats-sep" />

            {/* DATE */}

            <div className="detail-stat-item">

              <Calendar
                size={15}
              />

              <span>

                Uploaded{' '}

                {
                  formatDate(
                    document.uploadDate
                  )
                }

              </span>

            </div>

            {/* DOWNLOADS */}

            <div className="detail-stat-item">

              <Download
                size={15}
              />

              <span>

                {
                  downloadCount
                    .toLocaleString()
                }

                {' '}
                Downloads

              </span>

            </div>

            {/* RATING */}

            <div className="detail-stat-item rating">

              <Star
                size={15}
                className="star-icon"
              />

              <span>

                {
                  document.rating
                    .toFixed(1)
                }

                {' '}
                / 5.0

              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            MAIN DOCUMENT AREA
        ================================================= */}

        <div className="detail-main-layout">

          {/* PREVIEW */}

          <div className="detail-preview-col">

            <DocumentPreview
              document={
                document
              }
            />

          </div>

          {/* DOCUMENT ACTIONS */}

          <div className="detail-action-col">

            <div className="payt-card action-card">

              <h3 className="action-card-title">
                Document Actions
              </h3>

              <div className="action-meta-summary">

                <div className="summary-row">

                  <span className="label">
                    File Format:
                  </span>

                  <span className="value">
                    {document.fileType}
                  </span>

                </div>

                <div className="summary-row">

                  <span className="label">
                    File Size:
                  </span>

                  <span className="value">
                    {document.fileSize}
                  </span>

                </div>

                <div className="summary-row">

                  <span className="label">
                    Total Pages:
                  </span>

                  <span className="value">

                    {
                      document.pages
                        ? `${document.pages} Pages`
                        : 'Not available'
                    }

                  </span>

                </div>

                <div className="summary-row">

                  <span className="label">
                    Status:
                  </span>

                  <span className="value">
                    {document.status}
                  </span>

                </div>

              </div>

              {/* ACTION BUTTONS */}

              <div className="action-buttons-group">

                {/* DOWNLOAD */}

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={
                    Download
                  }
                  loading={
                    isDownloading
                  }
                  onClick={
                    handleDownloadClick
                  }
                  disabled={
                    isDownloading
                  }
                >

                  {
                    isDownloading
                      ? 'Preparing...'
                      : 'Download Document'
                  }

                </Button>

                {/* SAVE */}

                <Button
                  variant={
                    isSaved
                      ? 'outline'
                      : 'secondary'
                  }
                  size="md"
                  fullWidth
                  icon={
                    isSaved
                      ? BookmarkCheck
                      : Bookmark
                  }
                  loading={
                    isSavingLibrary
                  }
                  disabled={
                    isSavingLibrary ||
                    isCheckingSaved
                  }
                  onClick={
                    handleSaveLibrary
                  }
                >

                  {
                    isCheckingSaved
                      ? 'Checking...'
                      : isSavingLibrary
                        ? 'Saving...'
                        : isSaved
                          ? 'Saved in Library'
                          : 'Save to Library'
                  }

                </Button>

              </div>

              {/* SHARE */}

              <div className="action-card-footer">

                <button
                  type="button"
                  className="share-btn"
                  onClick={
                    handleShareClick
                  }
                >

                  <Share2
                    size={14}
                  />

                  Share Document

                </button>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            DOCUMENT INFORMATION
        ================================================= */}

        <div className="detail-info-sections">

          {/* ABOUT */}

          <div className="payt-card info-card">

            <h3 className="info-card-title">
              About This Document
            </h3>

            <p className="info-card-description">
              {document.description}
            </p>

          </div>

          {/* INFO */}

          <div className="payt-card info-card">

            <h3 className="info-card-title">
              Document Information
            </h3>

            <div className="info-spec-grid">

              <div className="spec-item">

                <span className="spec-label">
                  Category
                </span>

                <span className="spec-value">
                  {document.major}
                </span>

              </div>

              <div className="spec-item">

                <span className="spec-label">
                  Document Type
                </span>

                <span className="spec-value">
                  {document.fileType}
                </span>

              </div>

              <div className="spec-item">

                <span className="spec-label">
                  File Size
                </span>

                <span className="spec-value">
                  {document.fileSize}
                </span>

              </div>

              <div className="spec-item">

                <span className="spec-label">
                  Uploaded By
                </span>

                <span className="spec-value">

                  {
                    document
                      .uploader
                      .name
                  }

                </span>

              </div>

              <div className="spec-item">

                <span className="spec-label">
                  Upload Date
                </span>

                <span className="spec-value">

                  {
                    formatDate(
                      document.uploadDate
                    )
                  }

                </span>

              </div>

              <div className="spec-item">

                <span className="spec-label">
                  Downloads
                </span>

                <span className="spec-value">

                  {
                    downloadCount
                      .toLocaleString()
                  }

                </span>

              </div>

              <div className="spec-item">

                <span className="spec-label">
                  Views
                </span>

                <span className="spec-value">

                  {
                    document.views
                      .toLocaleString()
                  }

                </span>

              </div>

              <div className="spec-item">

                <span className="spec-label">
                  Reviews
                </span>

                <span className="spec-value">
                  {
                    document.reviewCount
                  }
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            REVIEWS SECTION
        ================================================= */}

        <div className="related-docs-section">

          {/* REVIEW HEADER */}

          <div
            style={{
              display:
                'flex',

              justifyContent:
                'space-between',

              alignItems:
                'center',

              gap:
                '12px',

              marginBottom:
                '16px',
            }}
          >

            <h2 className="section-title">
              Reviews
            </h2>

            <span className="badge badge-default">

              {
                reviewTotalCount
              } reviews

            </span>

          </div>

          {/* =================================================
              CURRENT USER CHECKING
          ================================================= */}

          {isLoadingCurrentUser ? (

            <div
              className="payt-card"
              style={{
                marginBottom:
                  '20px',
              }}
            >

              Checking your account...

            </div>

          ) : !currentUserId ? (

            // =============================================
            // NOT LOGGED IN
            // =============================================

            <div
              className="payt-card"
              style={{
                marginBottom:
                  '20px',
              }}
            >

              <h3>
                Want to write a review?
              </h3>

              <p>
                Please log in before reviewing this document.
              </p>

              <Link
                to="/login"
              >

                <Button
                  variant="primary"
                  size="sm"
                >
                  Login
                </Button>

              </Link>

            </div>

          ) : myReview ? (

            // =============================================
            // USER ALREADY HAS REVIEW
            // =============================================

            <div
              className="payt-card"
              style={{
                marginBottom:
                  '20px',
              }}
            >

              <strong>
                You have already reviewed this document.
              </strong>

              <p
                style={{
                  marginBottom:
                    0,

                  marginTop:
                    '6px',

                  opacity:
                    0.75,
                }}
              >
                You can edit or delete your review below.
              </p>

            </div>

          ) : (

            // =============================================
            // CREATE REVIEW FORM
            // =============================================

            <div
              className="payt-card"
              style={{
                marginBottom:
                  '20px',
              }}
            >

              <h3
                style={{
                  marginTop:
                    0,

                  marginBottom:
                    '6px',
                }}
              >
                Write a Review
              </h3>

              <p
                style={{
                  marginTop:
                    0,

                  marginBottom:
                    '20px',

                  opacity:
                    0.75,
                }}
              >
                Share your experience with this study material.
              </p>

              <form
                onSubmit={
                  handleSubmitReview
                }
              >

                {/* STAR RATING */}

                <div
                  style={{
                    marginBottom:
                      '18px',
                  }}
                >

                  <label
                    style={{
                      display:
                        'block',

                      marginBottom:
                        '8px',

                      fontWeight:
                        600,
                    }}
                  >
                    Your Rating
                  </label>

                  <div
                    style={{
                      display:
                        'flex',

                      gap:
                        '7px',

                      alignItems:
                        'center',
                    }}
                  >

                    {
                      [
                        1,
                        2,
                        3,
                        4,
                        5,
                      ].map(
                        (
                          star
                        ) => (

                          <button
                            key={
                              star
                            }
                            type="button"
                            aria-label={
                              `${star} star rating`
                            }
                            disabled={
                              isSubmittingReview
                            }
                            onClick={() => {
                              setReviewRating(
                                star
                              );

                              setReviewSubmitError(
                                ''
                              );
                            }}
                            style={{
                              border:
                                'none',

                              background:
                                'transparent',

                              padding:
                                '2px',

                              cursor:
                                isSubmittingReview
                                  ? 'not-allowed'
                                  : 'pointer',
                            }}
                          >

                            <Star
                              size={
                                28
                              }
                              className={
                                star <=
                                  reviewRating
                                  ? 'star-icon'
                                  : ''
                              }
                              fill={
                                star <=
                                  reviewRating
                                  ? 'currentColor'
                                  : 'none'
                              }
                            />

                          </button>

                        )
                      )
                    }

                    {reviewRating > 0 && (

                      <span
                        style={{
                          marginLeft:
                            '6px',

                          fontWeight:
                            600,
                        }}
                      >

                        {
                          reviewRating
                        } / 5

                      </span>

                    )}

                  </div>

                </div>

                {/* COMMENT */}

                <div
                  style={{
                    marginBottom:
                      '18px',
                  }}
                >

                  <label
                    htmlFor="review-comment"
                    style={{
                      display:
                        'block',

                      marginBottom:
                        '8px',

                      fontWeight:
                        600,
                    }}
                  >
                    Comment
                  </label>

                  <textarea
                    id="review-comment"
                    className="payt-textarea"
                    rows={4}
                    placeholder="Share your thoughts about this document..."
                    value={
                      reviewComment
                    }
                    disabled={
                      isSubmittingReview
                    }
                    onChange={(e) => {
                      setReviewComment(
                        e.target.value
                      );

                      setReviewSubmitError(
                        ''
                      );
                    }}
                    style={{
                      width:
                        '100%',
                    }}
                  />

                </div>

                {/* CREATE ERROR */}

                {reviewSubmitError && (

                  <p className="payt-input-error">

                    {
                      reviewSubmitError
                    }

                  </p>

                )}

                {/* SUBMIT */}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={
                    isSubmittingReview
                  }
                  disabled={
                    isSubmittingReview
                  }
                >

                  {
                    isSubmittingReview
                      ? 'Submitting...'
                      : 'Submit Review'
                  }

                </Button>

              </form>

            </div>

          )}

          {/* =================================================
              REVIEW LIST
          ================================================= */}

          {isLoadingReviews ? (

            <div className="payt-card">

              <p>
                Loading reviews...
              </p>

            </div>

          ) : reviewsError ? (

            // =============================================
            // ERROR
            // =============================================

            <div className="payt-card">

              <h3>
                Unable to load reviews
              </h3>

              <p>
                {reviewsError}
              </p>

            </div>

          ) : reviews.length === 0 ? (

            // =============================================
            // EMPTY
            // =============================================

            <div className="payt-card payt-grid-empty">

              <MessageSquare
                size={36}
                className="text-orange"
              />

              <h3>
                No reviews yet
              </h3>

              <p>
                Be the first student to review this document.
              </p>

            </div>

          ) : (

            // =============================================
            // REVIEWS
            // =============================================

            <div
              style={{
                display:
                  'grid',

                gap:
                  '16px',
              }}
            >

              {
                reviews.map(
                  (
                    review
                  ) => (

                    <div
                      key={
                        review.id
                      }
                      className="payt-card"
                    >

                      {/* =====================================
                          REVIEW HEADER
                      ===================================== */}

                      <div
                        style={{
                          display:
                            'flex',

                          justifyContent:
                            'space-between',

                          alignItems:
                            'flex-start',

                          gap:
                            '16px',
                        }}
                      >

                        {/* USER */}

                        <div
                          style={{
                            display:
                              'flex',

                            alignItems:
                              'center',

                            gap:
                              '12px',
                          }}
                        >

                          <img
                            src={
                              review
                                .user
                                .avatar
                            }
                            alt={
                              review
                                .user
                                .name
                            }
                            style={{
                              width:
                                '40px',

                              height:
                                '40px',

                              borderRadius:
                                '50%',

                              objectFit:
                                'cover',
                            }}
                          />

                          <div>

                            <strong>

                              {
                                review
                                  .user
                                  .name
                              }

                            </strong>

                            {review.createdAt && (

                              <div
                                style={{
                                  fontSize:
                                    '13px',

                                  opacity:
                                    0.7,

                                  marginTop:
                                    '3px',
                                }}
                              >

                                {
                                  formatDate(
                                    review.createdAt
                                  )
                                }

                              </div>

                            )}

                          </div>

                        </div>

                        {/* RATING */}

                        <div
                          style={{
                            display:
                              'flex',

                            alignItems:
                              'center',

                            gap:
                              '5px',
                          }}
                        >

                          <Star
                            size={
                              16
                            }
                            className="star-icon"
                            fill="currentColor"
                          />

                          <strong>

                            {
                              review.rating
                                .toFixed(1)
                            }

                          </strong>

                          <span>
                            / 5.0
                          </span>

                        </div>

                      </div>

                      {/* =====================================
                          EDIT MODE
                      ===================================== */}

                      {
                        editingReviewId ===
                          review.id ? (

                          <form
                            onSubmit={
                              handleUpdateReview
                            }
                            style={{
                              marginTop:
                                '18px',
                            }}
                          >

                            {/* EDIT RATING */}

                            <div
                              style={{
                                marginBottom:
                                  '14px',
                              }}
                            >

                              <label
                                style={{
                                  display:
                                    'block',

                                  marginBottom:
                                    '8px',

                                  fontWeight:
                                    600,
                                }}
                              >
                                Rating
                              </label>

                              <div
                                style={{
                                  display:
                                    'flex',

                                  gap:
                                    '7px',
                                }}
                              >

                                {
                                  [
                                    1,
                                    2,
                                    3,
                                    4,
                                    5,
                                  ].map(
                                    (
                                      star
                                    ) => (

                                      <button
                                        key={
                                          star
                                        }
                                        type="button"
                                        disabled={
                                          isUpdatingReview
                                        }
                                        onClick={() => {
                                          setEditRating(
                                            star
                                          );

                                          setReviewActionError(
                                            ''
                                          );
                                        }}
                                        style={{
                                          border:
                                            'none',

                                          background:
                                            'transparent',

                                          padding:
                                            '2px',

                                          cursor:
                                            isUpdatingReview
                                              ? 'not-allowed'
                                              : 'pointer',
                                        }}
                                      >

                                        <Star
                                          size={
                                            26
                                          }
                                          className={
                                            star <=
                                              editRating
                                              ? 'star-icon'
                                              : ''
                                          }
                                          fill={
                                            star <=
                                              editRating
                                              ? 'currentColor'
                                              : 'none'
                                          }
                                        />

                                      </button>

                                    )
                                  )
                                }

                              </div>

                            </div>

                            {/* EDIT COMMENT */}

                            <textarea
                              className="payt-textarea"
                              rows={4}
                              value={
                                editComment
                              }
                              disabled={
                                isUpdatingReview
                              }
                              onChange={(e) => {
                                setEditComment(
                                  e.target.value
                                );

                                setReviewActionError(
                                  ''
                                );
                              }}
                              style={{
                                width:
                                  '100%',
                              }}
                            />

                            {/* UPDATE ERROR */}

                            {reviewActionError && (

                              <p className="payt-input-error">

                                {
                                  reviewActionError
                                }

                              </p>

                            )}

                            {/* EDIT BUTTONS */}

                            <div
                              style={{
                                display:
                                  'flex',

                                gap:
                                  '10px',

                                marginTop:
                                  '12px',
                              }}
                            >

                              <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                loading={
                                  isUpdatingReview
                                }
                                disabled={
                                  isUpdatingReview
                                }
                              >
                                Save Changes
                              </Button>

                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={
                                  isUpdatingReview
                                }
                                onClick={
                                  handleCancelEditReview
                                }
                              >
                                Cancel
                              </Button>

                            </div>

                          </form>

                        ) : (

                          // ===================================
                          // NORMAL REVIEW VIEW
                          // ===================================

                          <>

                            <p
                              style={{
                                marginTop:
                                  '16px',

                                marginBottom:
                                  isOwnReview(
                                    review
                                  )
                                    ? '14px'
                                    : 0,
                              }}
                            >

                              {
                                review.content ||
                                'No comment provided.'
                              }

                            </p>

                            {/* =================================
                                OWNER ACTIONS
                            ================================= */}

                            {
                              isOwnReview(
                                review
                              ) && (

                                <div
                                  style={{
                                    display:
                                      'flex',

                                    gap:
                                      '10px',

                                    flexWrap:
                                      'wrap',
                                  }}
                                >

                                  {/* EDIT */}

                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    icon={
                                      Edit3
                                    }
                                    disabled={
                                      deletingReviewId ===
                                      review.id
                                    }
                                    onClick={() =>
                                      handleOpenEditReview(
                                        review
                                      )
                                    }
                                  >
                                    Edit
                                  </Button>

                                  {/* DELETE */}

                                  <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    icon={
                                      Trash2
                                    }
                                    loading={
                                      deletingReviewId ===
                                      review.id
                                    }
                                    disabled={
                                      deletingReviewId ===
                                      review.id
                                    }
                                    onClick={() =>
                                      handleDeleteReview(
                                        review.id
                                      )
                                    }
                                  >

                                    {
                                      deletingReviewId ===
                                        review.id
                                        ? 'Deleting...'
                                        : 'Delete'
                                    }

                                  </Button>

                                </div>

                              )
                            }

                          </>

                        )
                      }

                    </div>

                  )
                )
              }

            </div>

          )}

        </div>

        {/* =================================================
            RELATED DOCUMENTS - BACKEND THẬT

            GET /documents
            + categoryId của tài liệu hiện tại

            Không còn dùng MOCK_DOCUMENTS.
        ================================================= */}

        <div className="related-docs-section">

          <h2 className="section-title">
            Related Documents
          </h2>

          {/* ===============================================
              LOADING STATE
          =============================================== */}

          {isLoadingRelatedDocs ? (

            <div className="payt-card payt-grid-empty">

              <FileText
                size={36}
                className="text-orange"
              />

              <h3>
                Loading related documents...
              </h3>

              <p>
                Finding more study materials in the same category.
              </p>

            </div>

          ) : relatedDocsError ? (

            // =============================================
            // ERROR STATE
            // =============================================

            <div className="payt-card payt-grid-empty">

              <FileText
                size={36}
                className="text-orange"
              />

              <h3>
                Unable to load related documents
              </h3>

              <p>
                {relatedDocsError}
              </p>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={
                  loadRelatedDocuments
                }
              >
                Try Again
              </Button>

            </div>

          ) : relatedDocs.length === 0 ? (

            // =============================================
            // EMPTY STATE
            // =============================================

            <div className="payt-card payt-grid-empty">

              <FileText
                size={36}
                className="text-orange"
              />

              <h3>
                No related documents found
              </h3>

              <p>
                No other approved study materials are available
                in this category yet.
              </p>

            </div>

          ) : (

            // =============================================
            // SUCCESS STATE
            // =============================================

            <div className="responsive-grid-3">

              {
                relatedDocs.map(
                  (
                    doc
                  ) => (

                    <DocumentCard
                      key={
                        doc.id
                      }
                      document={
                        doc
                      }
                    />

                  )
                )
              }

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default DocumentDetail;