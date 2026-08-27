import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Download, Star } from 'lucide-react';

export const DocumentDetailHeader = ({
  document,
  downloadCount,
  formatDate,
}) => {
  if (!document) {
    return null;
  }

  return (
    <>
      {/* BREADCRUMB */}
      <div className="detail-breadcrumb-bar">
        <div className="container breadcrumb-container">
          <Link to="/documents" className="back-link">
            <ArrowLeft size={16} />
            Back to Documents
          </Link>

          <div className="breadcrumb-path">
            <Link to="/">Home</Link>
            {' / '}
            <Link to="/documents">Documents</Link>
            {' / '}
            <span className="current">{document.title}</span>
          </div>
        </div>
      </div>

      {/* DOCUMENT HEADER */}
      <div className="doc-detail-header">
        <div className="header-badges">
          <span className="badge badge-major">{document.major}</span>

          <span
            className={`badge ${
              document.fileType === 'PDF'
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

        <h1 className="detail-doc-title">{document.title}</h1>

        <div className="detail-uploader-row">
          {/* UPLOADER */}
          <div className="uploader-avatar-box">
            <img
              src={document.uploader.avatar}
              alt={document.uploader.name}
              className="uploader-avatar"
            />
            <div className="uploader-text">
              <span className="uploader-name">
                {document.uploader.name}
              </span>
              <span className="uploader-role">
                {document.uploader.role}
              </span>
            </div>
          </div>

          <div className="uploader-stats-sep" />

          {/* DATE */}
          <div className="detail-stat-item">
            <Calendar size={15} />
            <span>
              Uploaded {formatDate(document.uploadDate)}
            </span>
          </div>

          {/* DOWNLOADS */}
          <div className="detail-stat-item">
            <Download size={15} />
            <span>
              {downloadCount.toLocaleString()} Downloads
            </span>
          </div>

          {/* RATING */}
          <div className="detail-stat-item rating">
            <Star size={15} className="star-icon" />
            <span>{document.rating.toFixed(1)} / 5.0</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentDetailHeader;
