import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import {
  ArrowLeft,
  Download,
  Bookmark,
  BookmarkCheck,
  Star,
  Calendar,
  Share2,
  FileText,
} from 'lucide-react';

import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import DocumentPreview from '../../components/document/DocumentPreview';
import DocumentCard from '../../components/document/DocumentCard';

import {
  getDocumentByIdApi,
  downloadDocumentApi,
  getDocumentSaveStatusApi,
  saveDocumentApi,
  unsaveDocumentApi,
} from '../../services/document.api';

import { MOCK_DOCUMENTS } from '../../mock/documents';
import { formatDate } from '../../utils/formatters';

import './DocumentDetail.css';

// =====================================================
// HELPER: ĐỌC TRẠNG THÁI SAVED TỪ RESPONSE BACKEND
// =====================================================
//
// Vì chưa biết chính xác GET /documents/:id/save
// trả field tên gì, helper này hỗ trợ một số dạng phổ biến.
//
// Sau khi test response thật từ BE,
// mình có thể rút gọn lại cho đúng contract chính xác.
// =====================================================

const extractSavedStatus = (response) => {
  if (typeof response?.isSaved === 'boolean') {
    return response.isSaved;
  }

  if (typeof response?.saved === 'boolean') {
    return response.saved;
  }

  if (typeof response?.data === 'boolean') {
    return response.data;
  }

  if (typeof response?.data?.isSaved === 'boolean') {
    return response.data.isSaved;
  }

  if (typeof response?.data?.saved === 'boolean') {
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

export const DocumentDetail = () => {
  const { id } = useParams();

  // =====================================================
  // 1. DOCUMENT STATE
  // =====================================================

  const [document, setDocument] = useState(null);

  const [isLoadingDocument, setIsLoadingDocument] =
    useState(true);

  const [documentError, setDocumentError] =
    useState('');

  // Related Documents vẫn mock ở bước này.
  const [relatedDocs] = useState(
    MOCK_DOCUMENTS.slice(0, 3)
  );

  // =====================================================
  // 2. DOWNLOAD STATE
  // =====================================================

  const [downloadCount, setDownloadCount] =
    useState(0);

  const [isDownloading, setIsDownloading] =
    useState(false);

  // =====================================================
  // 3. SAVE DOCUMENT STATE
  // =====================================================

  const [isSaved, setIsSaved] =
    useState(false);

  const [isCheckingSaved, setIsCheckingSaved] =
    useState(true);

  const [isSavingLibrary, setIsSavingLibrary] =
    useState(false);

  // =====================================================
  // 4. TOAST STATE
  // =====================================================

  const [toastMessage, setToastMessage] =
    useState('');

  const [toastType, setToastType] =
    useState('success');

  // =====================================================
  // 5. GET DOCUMENT DETAIL FROM BACKEND
  // =====================================================

  useEffect(() => {
    const fetchDocumentDetail = async () => {
      setIsLoadingDocument(true);
      setDocumentError('');

      try {
        const response =
          await getDocumentByIdApi(id);

        console.log(
          'Document Detail API response:',
          response
        );

        const backendDocument =
          response.document ||
          response.data ||
          response;

        // ===============================================
        // MAP BACKEND DATA -> FRONTEND DATA
        // ===============================================

        const mappedDocument = {
          id: backendDocument.id,

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

          // Backend hiện chưa có subject tương ứng.
          subject:
            backendDocument.subject ||
            '',

          fileType:
            backendDocument.file_type
              ? backendDocument.file_type
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
            backendDocument.download_count ??
            0,

          views:
            backendDocument.view_count ??
            0,

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

        setDocument(mappedDocument);

        setDownloadCount(
          mappedDocument.downloads
        );
      } catch (error) {
        console.error(
          'Document Detail API error:',
          error
        );

        setDocumentError(
          error.response?.data?.message ||
          'Unable to load document.'
        );
      } finally {
        setIsLoadingDocument(false);
      }
    };

    if (id) {
      fetchDocumentDetail();
    }
  }, [id]);

  // =====================================================
  // 6. CHECK SAVED STATUS FROM BACKEND
  // =====================================================

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!id) {
        return;
      }

      setIsCheckingSaved(true);

      try {
        const response =
          await getDocumentSaveStatusApi(id);

        console.log(
          'Document Save Status API response:',
          response
        );

        const saved =
          extractSavedStatus(response);

        setIsSaved(saved);
      } catch (error) {
        /*
          Nếu Backend dùng 404 để biểu thị
          tài liệu chưa được save,
          thì coi như isSaved = false.
        */
        if (
          error.response?.status === 404
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
        setIsCheckingSaved(false);
      }
    };

    checkSavedStatus();
  }, [id]);

  // =====================================================
  // 7. TOAST
  // =====================================================

  const showToast = (
    message,
    type = 'success'
  ) => {
    setToastMessage(message);
    setToastType(type);
  };

  // =====================================================
  // 8. DOWNLOAD DOCUMENT - BACKEND THẬT
  // =====================================================

  const handleDownloadClick = async () => {
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

      // ===============================================
      // CASE 1:
      // Backend trả JSON chứa fileUrl
      // ===============================================

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
          window.document.createElement(
            'a'
          );

        link.href =
          downloadUrl;

        link.target =
          '_blank';

        link.rel =
          'noopener noreferrer';

        window.document.body.appendChild(
          link
        );

        link.click();

        link.remove();
      }

      // ===============================================
      // CASE 2:
      // Backend trả file trực tiếp
      // ===============================================

      else {
        const blobUrl =
          URL.createObjectURL(
            response.data
          );

        const link =
          window.document.createElement(
            'a'
          );

        link.href =
          blobUrl;

        const extension =
          document.fileType
            ?.toLowerCase() ||
          'file';

        link.download =
          `${document.title}.${extension}`;

        window.document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(
          blobUrl
        );
      }

      setDownloadCount(
        (prev) => prev + 1
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
        error.response?.data?.message ||
        error.message ||
        'Unable to download document.',
        'error'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // =====================================================
  // 9. SAVE / UNSAVE DOCUMENT - BACKEND THẬT
  // =====================================================

  const handleSaveLibrary = async () => {
    if (
      isSavingLibrary ||
      isCheckingSaved ||
      !document
    ) {
      return;
    }

    setIsSavingLibrary(true);

    try {
      // ===============================================
      // CHƯA SAVE -> SAVE
      // ===============================================

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

      // ===============================================
      // ĐÃ SAVE -> UNSAVE
      // ===============================================

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
        error.response?.data?.message ||
        'Unable to update saved document.',
        'error'
      );
    } finally {
      setIsSavingLibrary(false);
    }
  };

  // =====================================================
  // 10. SHARE
  // =====================================================

  const handleShareClick = () => {
    if (
      navigator.clipboard
    ) {
      navigator.clipboard
        .writeText(
          window.location.href
        )
        .catch(() => { });
    }

    showToast(
      'Document link copied to clipboard!',
      'info'
    );
  };

  // =====================================================
  // 11. LOADING
  // =====================================================

  if (isLoadingDocument) {
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
  // 12. ERROR
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

            <Link to="/documents">
              Back to Documents
            </Link>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // 13. UI
  // =====================================================

  return (
    <div className="payt-document-detail-page">

      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() =>
          setToastMessage('')
        }
      />

      {/* ===============================================
          BREADCRUMB
      =============================================== */}

      <div className="detail-breadcrumb-bar">

        <div className="container breadcrumb-container">

          <Link
            to="/documents"
            className="back-link"
          >
            <ArrowLeft size={16} />

            Back to Documents
          </Link>

          <div className="breadcrumb-path">

            <Link to="/">
              Home
            </Link>

            {' / '}

            <Link to="/documents">
              Documents
            </Link>

            {' / '}

            <span className="current">
              {document.title}
            </span>

          </div>

        </div>

      </div>

      <div className="container detail-content-container">

        {/* ===============================================
            DOCUMENT HEADER
        =============================================== */}

        <div className="doc-detail-header">

          <div className="header-badges">

            <span className="badge badge-major">
              {document.major}
            </span>

            <span
              className={`badge ${document.fileType ===
                'PDF'
                ? 'badge-pdf'
                : 'badge-slides'
                }`}
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

            <div className="uploader-avatar-box">

              <img
                src={
                  document.uploader
                    .avatar
                }
                alt={
                  document.uploader
                    .name
                }
                className="uploader-avatar"
              />

              <div className="uploader-text">

                <span className="uploader-name">
                  {
                    document.uploader
                      .name
                  }
                </span>

                <span className="uploader-role">
                  {
                    document.uploader
                      .role
                  }
                </span>

              </div>

            </div>

            <div className="uploader-stats-sep" />

            <div className="detail-stat-item">

              <Calendar size={15} />

              <span>
                Uploaded{' '}
                {formatDate(
                  document.uploadDate
                )}
              </span>

            </div>

            <div className="detail-stat-item">

              <Download size={15} />

              <span>
                {downloadCount.toLocaleString()}
                {' '}
                Downloads
              </span>

            </div>

            <div className="detail-stat-item rating">

              <Star
                size={15}
                className="star-icon"
              />

              <span>
                {document.rating.toFixed(
                  1
                )}
                {' '}
                / 5.0
              </span>

            </div>

          </div>

        </div>

        {/* ===============================================
            MAIN LAYOUT
        =============================================== */}

        <div className="detail-main-layout">

          {/* PREVIEW */}

          <div className="detail-preview-col">

            <DocumentPreview
              document={document}
            />

          </div>

          {/* ACTIONS */}

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

                    {document.pages
                      ? `${document.pages} Pages`
                      : 'Not available'}

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

              {/* =========================================
                  ACTION BUTTONS
              ========================================= */}

              <div className="action-buttons-group">

                {/* DOWNLOAD */}

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={Download}
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

                  {isDownloading
                    ? 'Preparing...'
                    : 'Download Document'}

                </Button>

                {/* SAVE / UNSAVE */}

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

                  {isCheckingSaved
                    ? 'Checking...'
                    : isSavingLibrary
                      ? 'Saving...'
                      : isSaved
                        ? 'Saved in Library'
                        : 'Save to Library'}

                </Button>

              </div>

              <div className="action-card-footer">

                <button
                  type="button"
                  className="share-btn"
                  onClick={
                    handleShareClick
                  }
                >

                  <Share2 size={14} />

                  Share Document

                </button>

              </div>

            </div>

          </div>

        </div>

        {/* ===============================================
            ABOUT DOCUMENT
        =============================================== */}

        <div className="detail-info-sections">

          <div className="payt-card info-card">

            <h3 className="info-card-title">
              About This Document
            </h3>

            <p className="info-card-description">
              {document.description}
            </p>

          </div>

          {/* ===========================================
              DOCUMENT INFORMATION
          =========================================== */}

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
                    document.uploader
                      .name
                  }
                </span>

              </div>

              <div className="spec-item">

                <span className="spec-label">
                  Upload Date
                </span>

                <span className="spec-value">
                  {formatDate(
                    document.uploadDate
                  )}
                </span>

              </div>

              <div className="spec-item">

                <span className="spec-label">
                  Downloads
                </span>

                <span className="spec-value">
                  {downloadCount.toLocaleString()}
                </span>

              </div>

              <div className="spec-item">

                <span className="spec-label">
                  Views
                </span>

                <span className="spec-value">
                  {document.views.toLocaleString()}
                </span>

              </div>

              <div className="spec-item">

                <span className="spec-label">
                  Reviews
                </span>

                <span className="spec-value">
                  {document.reviewCount}
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* ===============================================
            RELATED DOCUMENTS
            VẪN MOCK - SẼ LÀM SAU
        =============================================== */}

        <div className="related-docs-section">

          <h2 className="section-title">
            Related Documents
          </h2>

          {relatedDocs.length === 0 ? (

            <div className="payt-card payt-grid-empty">

              <FileText
                size={36}
                className="text-orange"
              />

              <h3>
                No related documents found
              </h3>

              <p>
                Check back later as more
                study materials are added.
              </p>

            </div>

          ) : (

            <div className="responsive-grid-3">

              {relatedDocs.map(
                (doc) => (

                  <DocumentCard
                    key={doc.id}
                    document={doc}
                  />

                )
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default DocumentDetail;