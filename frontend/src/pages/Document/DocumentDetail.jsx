import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Bookmark,
  BookmarkCheck,
  Star,
  Calendar,
  CheckCircle,
  Share2,
  FileText
} from 'lucide-react';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import DocumentPreview from '../../components/document/DocumentPreview';
import DocumentCard from '../../components/document/DocumentCard';
import { MOCK_DOCUMENTS } from '../../mock/documents';
import { formatDate } from '../../utils/formatters';
import './DocumentDetail.css';

export const DocumentDetail = () => {
  const { id } = useParams();
  const document = MOCK_DOCUMENTS.find(
    (doc) => doc.id === id || doc.id === `doc-${id}` || doc.id.replace('doc-', '') === id
  ) || MOCK_DOCUMENTS[0];
  const relatedDocs = MOCK_DOCUMENTS.filter((doc) => doc.id !== document.id).slice(0, 3);

  const [downloadCount, setDownloadCount] = useState(document.downloads);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleDownloadClick = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadCount((prev) => prev + 1);
      showToast(`Initiated download for "${document.title.slice(0, 35)}..."`, 'success');
    }, 400);
  };

  const handleSaveLibrary = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    if (nextSaved) {
      showToast('Document saved to your library!', 'success');
    } else {
      showToast('Document removed from your library.', 'info');
    }
  };

  const handleShareClick = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    showToast('Document link copied to clipboard!', 'info');
  };

  return (
    <div className="payt-document-detail-page">
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage('')}
      />

      {/* Breadcrumb Header */}
      <div className="detail-breadcrumb-bar">
        <div className="container breadcrumb-container">
          <Link to="/documents" className="back-link">
            <ArrowLeft size={16} /> Back to Documents
          </Link>
          <div className="breadcrumb-path">
            <Link to="/">Home</Link> / <Link to="/documents">Documents</Link> / <span className="current">{document.title}</span>
          </div>
        </div>
      </div>

      <div className="container detail-content-container">
        {/* Main Document Title Header */}
        <div className="doc-detail-header">
          <div className="header-badges">
            <span className="badge badge-major">{document.major}</span>
            <span className={`badge ${document.fileType === 'PDF' ? 'badge-pdf' : 'badge-slides'}`}>
              {document.fileType}
            </span>
            <span className="badge badge-default">{document.subject}</span>
          </div>

          <h1 className="detail-doc-title">{document.title}</h1>

          <div className="detail-uploader-row">
            <div className="uploader-avatar-box">
              <img src={document.uploader.avatar} alt={document.uploader.name} className="uploader-avatar" />
              <div className="uploader-text">
                <span className="uploader-name">{document.uploader.name}</span>
                <span className="uploader-role">{document.uploader.role}</span>
              </div>
            </div>
            <div className="uploader-stats-sep"></div>
            <div className="detail-stat-item">
              <Calendar size={15} />
              <span>Uploaded {formatDate(document.uploadDate)}</span>
            </div>
            <div className="detail-stat-item">
              <Download size={15} />
              <span>{downloadCount.toLocaleString()} Downloads</span>
            </div>
            <div className="detail-stat-item rating">
              <Star size={15} className="star-icon" />
              <span>{document.rating} / 5.0</span>
            </div>
          </div>
        </div>

        {/* 2-Column Main Layout: Left Preview / Right Action Card */}
        <div className="detail-main-layout">
          {/* Left Column: Preview Viewport */}
          <div className="detail-preview-col">
            <DocumentPreview document={document} />
          </div>

          {/* Right Column: Download & Action Sidebar Card */}
          <div className="detail-action-col">
            <div className="payt-card action-card">
              <h3 className="action-card-title">Document Actions</h3>

              <div className="action-meta-summary">
                <div className="summary-row">
                  <span className="label">File Format:</span>
                  <span className="value">{document.fileType}</span>
                </div>
                <div className="summary-row">
                  <span className="label">File Size:</span>
                  <span className="value">{document.fileSize}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Total Pages:</span>
                  <span className="value">{document.pages} Pages</span>
                </div>
                <div className="summary-row">
                  <span className="label">Verified Quality:</span>
                  <span className="value text-success"><CheckCircle size={14} /> Approved</span>
                </div>
              </div>

              <div className="action-buttons-group">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={Download}
                  loading={isDownloading}
                  onClick={handleDownloadClick}
                >
                  {isDownloading ? 'Preparing...' : 'Download Document'}
                </Button>
                <Button
                  variant={isSaved ? 'outline' : 'secondary'}
                  size="md"
                  fullWidth
                  icon={isSaved ? BookmarkCheck : Bookmark}
                  onClick={handleSaveLibrary}
                >
                  {isSaved ? 'Saved in Library' : 'Save to Library'}
                </Button>
              </div>

              <div className="action-card-footer">
                <button className="share-btn" onClick={handleShareClick}>
                  <Share2 size={14} /> Share Document
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* About & Metadata Specifications */}
        <div className="detail-info-sections">
          {/* About Section */}
          <div className="payt-card info-card">
            <h3 className="info-card-title">About This Document</h3>
            <p className="info-card-description">{document.description}</p>
          </div>

          {/* Key Specifications Grid */}
          <div className="payt-card info-card">
            <h3 className="info-card-title">Document Information</h3>
            <div className="info-spec-grid">
              <div className="spec-item">
                <span className="spec-label">Academic Major</span>
                <span className="spec-value">{document.major}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Subject / Course</span>
                <span className="spec-value">{document.subject}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Document Type</span>
                <span className="spec-value">{document.fileType}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Total Pages</span>
                <span className="spec-value">{document.pages} Pages</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">File Size</span>
                <span className="spec-value">{document.fileSize}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Uploaded By</span>
                <span className="spec-value">{document.uploader.name}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Upload Date</span>
                <span className="spec-value">{formatDate(document.uploadDate)}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Downloads</span>
                <span className="spec-value">{downloadCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Documents Section */}
        <div className="related-docs-section">
          <h2 className="section-title">Related Documents</h2>
          {relatedDocs.length === 0 ? (
            <div className="payt-card payt-grid-empty">
              <FileText size={36} className="text-orange" />
              <h3>No related documents found</h3>
              <p>Check back later as more study materials are added.</p>
            </div>
          ) : (
            <div className="responsive-grid-3">
              {relatedDocs.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
