import {
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  useParams,
  Link,
} from 'react-router-dom';

import Toast from '../../components/common/Toast';
import DocumentPreview from '../../components/document/DocumentPreview';
import DocumentDetailHeader from '../../components/document/detail/DocumentDetailHeader';
import DocumentActionsCard from '../../components/document/detail/DocumentActionsCard';
import DocumentInfo from '../../components/document/detail/DocumentInfo';
import RelatedDocuments from '../../components/document/detail/RelatedDocuments';
import ReviewSection from '../../components/document/review/ReviewSection';

// DOCUMENT API

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

// USER API

import {
  getUserProfileApi,
} from '../../services/user.api';

import {
  formatDate,
} from '../../utils/formatters';

import './DocumentDetail.css';

// HELPER: EXTRACT SAVED STATUS

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

// HELPER: MAP BACKEND REVIEW → UI REVIEW

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

// HELPER: FORMAT FILE SIZE
//
// GET /documents trả file_size bằng bytes.
// DocumentCard của UI đang hiển thị dạng KB / MB,
// vì vậy map về đúng format trước khi render.
//

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

// HELPER: FORMAT FILE TYPE
//
// Ví dụ Backend:
// application/pdf
//
// UI:
// PDF
//

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

// HELPER: MAP BACKEND DOCUMENT → DOCUMENT CARD
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

// DOCUMENT DETAIL COMPONENT

export const DocumentDetail = () => {
  const { id } = useParams();

  // 1. DOCUMENT STATE

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

  // RELATED DOCUMENTS STATE
  //
  // Không dùng MOCK_DOCUMENTS nữa.
  //
  // Related Documents sẽ được lấy từ:
  //
  // GET /documents
  //
  // với categoryId của document hiện tại.
  //

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

  // 2. DOWNLOAD STATE

  const [
    downloadCount,
    setDownloadCount,
  ] = useState(0);

  const [
    isDownloading,
    setIsDownloading,
  ] = useState(false);

  // 3. SAVE DOCUMENT STATE

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

  // 4. REVIEWS STATE

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

  // 5. CURRENT USER STATE
  //
  // Dùng để xác định review nào là của user
  // đang đăng nhập.
  //
  // Chỉ review của chính mình mới có:
  // Edit
  // Delete
  //

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState(null);

  const [
    isLoadingCurrentUser,
    setIsLoadingCurrentUser,
  ] = useState(true);

  // 6. CREATE REVIEW STATE

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

  // 7. EDIT REVIEW STATE

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

  // 8. DELETE REVIEW STATE

  const [
    deletingReviewId,
    setDeletingReviewId,
  ] = useState(null);

  // 9. TOAST STATE

  const [
    toastMessage,
    setToastMessage,
  ] = useState('');

  const [
    toastType,
    setToastType,
  ] = useState('success');

  // 10. SHOW TOAST

  const showToast = (
    message,
    type = 'success'
  ) => {
    setToastMessage(message);
    setToastType(type);
  };

  // 11. LOAD DOCUMENT DETAIL
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

  // LOAD DOCUMENT KHI MỞ TRANG

  useEffect(() => {
    loadDocumentDetail();
  }, [loadDocumentDetail]);

  // 11A. LOAD RELATED DOCUMENTS
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

          // GET /documents?categoryId=...

          const response =
            await getDocumentsApi(
              query
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

          // 1. Loại document đang xem.
          // 2. Map Backend → UI.
          // 3. Chỉ lấy tối đa 3 tài liệu.

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

  // 12. LOAD REVIEWS
  //
  // GET /documents/:documentId/reviews
  //

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

          setReviews(
            mappedReviews
          );

          // Backend có pagination.
          //
          // Nếu có totalCount:
          // dùng tổng thật từ Backend.
          //
          // Nếu không:
          // dùng số review hiện có.

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

  // LOAD REVIEWS KHI MỞ TRANG

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // 13. GET CURRENT USER
  //
  // GET /users/profile
  //

  useEffect(() => {
    const loadCurrentUser =
      async () => {
        setIsLoadingCurrentUser(
          true
        );

        try {
          const response =
            await getUserProfileApi();

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

  // 14. CHECK SAVED STATUS
  //
  // GET /documents/:documentId/save
  //

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

  // 15. DOWNLOAD DOCUMENT
  //
  // GET /documents/:documentId/download
  //

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

        const contentType =
          response.headers?.[
          'content-type'
          ] || '';

        // CASE 1:
        // Backend trả JSON có fileUrl

        if (
          contentType.includes(
            'application/json'
          )
        ) {
          const text =
            await response.data.text();

          const json =
            JSON.parse(text);

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

        // CASE 2:
        // Backend trả file trực tiếp

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

  // 16. SAVE / UNSAVE DOCUMENT

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
        // CHƯA SAVE → SAVE

        if (!isSaved) {
          const response =
            await saveDocumentApi(
              document.id
            );

          setIsSaved(true);

          showToast(
            response.message ||
            'Document saved to your library!',
            'success'
          );
        }

        // ĐÃ SAVE → UNSAVE

        else {
          const response =
            await unsaveDocumentApi(
              document.id
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

  // 17. CREATE REVIEW
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

      // RATING 1 → 5

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

        const response =
          await createDocumentReviewApi(
            id,
            reviewData
          );

        setReviewRating(0);
        setReviewComment('');

        showToast(
          response.message ||
          'Review submitted successfully!',
          'success'
        );

        // REFRESH:
        //
        // Reviews
        // Average Rating
        // Review Count

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

  // 18. OPEN EDIT REVIEW

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

  // 19. CANCEL EDIT REVIEW

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

  // 20. UPDATE REVIEW
  //
  // PATCH /reviews/:reviewId
  //

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

        const response =
          await updateReviewApi(
            editingReviewId,
            reviewData
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

  // 21. DELETE REVIEW
  //
  // DELETE /reviews/:reviewId
  //

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

  // 22. SHARE DOCUMENT

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

  // 23. CHECK REVIEW OWNERSHIP

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

  // REVIEW HIỆN TẠI CỦA USER
  //
  // Nếu user đã review document:
  //
  // Không hiện Write a Review nữa.
  // Thay vào đó user Edit/Delete review cũ.
  //

  const myReview =
    currentUserId
      ? reviews.find(
        (review) =>
          isOwnReview(
            review
          )
      )
      : null;

  // 24. LOADING DOCUMENT

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

  // 25. DOCUMENT ERROR

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

  // 26. UI

  return (
    <div className="payt-document-detail-page">
      {/* TOAST */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage('')}
      />

      {/* HEADER & BREADCRUMB */}
      <DocumentDetailHeader
        document={document}
        downloadCount={downloadCount}
        formatDate={formatDate}
      />

      {/* CONTENT CONTAINER */}
      <div className="container detail-content-container">
        {/* MAIN LAYOUT: PREVIEW & ACTIONS */}
        <div className="detail-main-layout">
          {/* PREVIEW */}
          <div className="detail-preview-col">
            <DocumentPreview document={document} />
          </div>

          {/* ACTIONS */}
          <div className="detail-action-col">
            <DocumentActionsCard
              document={document}
              isDownloading={isDownloading}
              isSaved={isSaved}
              isCheckingSaved={isCheckingSaved}
              isSavingLibrary={isSavingLibrary}
              handleDownloadClick={handleDownloadClick}
              handleSaveLibrary={handleSaveLibrary}
              handleShareClick={handleShareClick}
            />
          </div>
        </div>

        {/* DOCUMENT INFORMATION */}
        <DocumentInfo
          document={document}
          formatDate={formatDate}
          downloadCount={downloadCount}
        />

        {/* REVIEWS SECTION */}
        <ReviewSection
          reviewTotalCount={reviewTotalCount}
          isLoadingCurrentUser={isLoadingCurrentUser}
          currentUserId={currentUserId}
          myReview={myReview}
          handleSubmitReview={handleSubmitReview}
          reviewRating={reviewRating}
          setReviewRating={setReviewRating}
          reviewComment={reviewComment}
          setReviewComment={setReviewComment}
          isSubmittingReview={isSubmittingReview}
          reviewSubmitError={reviewSubmitError}
          setReviewSubmitError={setReviewSubmitError}
          isLoadingReviews={isLoadingReviews}
          reviewsError={reviewsError}
          reviews={reviews}
          editingReviewId={editingReviewId}
          isOwnReview={isOwnReview}
          formatDate={formatDate}
          handleOpenEditReview={handleOpenEditReview}
          deletingReviewId={deletingReviewId}
          handleDeleteReview={handleDeleteReview}
          handleUpdateReview={handleUpdateReview}
          editRating={editRating}
          setEditRating={setEditRating}
          editComment={editComment}
          setEditComment={setEditComment}
          isUpdatingReview={isUpdatingReview}
          reviewActionError={reviewActionError}
          setReviewActionError={setReviewActionError}
          handleCancelEditReview={handleCancelEditReview}
        />

        {/* RELATED DOCUMENTS */}
        <RelatedDocuments
          isLoadingRelatedDocs={isLoadingRelatedDocs}
          relatedDocsError={relatedDocsError}
          relatedDocs={relatedDocs}
          loadRelatedDocuments={loadRelatedDocuments}
        />
      </div>
    </div>
  );
};

export default DocumentDetail;