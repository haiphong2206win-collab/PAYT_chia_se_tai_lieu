import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, Star, Calendar, FileCode, Presentation, File } from 'lucide-react';
import './DocumentCard.css';

export const DocumentCard = ({ document, variant = 'standard' }) => {
  const {
    id,
    title,
    major,
    subject,
    fileType = 'PDF',
    fileSize = '3.5 MB',
    downloads = 0,
    rating = 4.8,
    uploadDate = '2026-08-10',
    uploader
  } = document;

  const renderBadgeClass = (type) => {
    switch (type.toUpperCase()) {
      case 'PDF': return 'badge-pdf';
      case 'SLIDES':
      case 'PPTX': return 'badge-slides';
      case 'NOTES': return 'badge-notes';
      default: return 'badge-default';
    }
  };

  const renderTypeIcon = (type) => {
    switch (type.toUpperCase()) {
      case 'SLIDES':
      case 'PPTX': return <Presentation size={24} className="doc-icon slides" />;
      case 'NOTES': return <FileCode size={24} className="doc-icon notes" />;
      default: return <FileText size={24} className="doc-icon pdf" />;
    }
  };

  return (
    <Link to={`/documents/${id}`} className={`payt-card payt-card-interactive doc-card doc-card-${variant}`}>
      <div className="doc-card-header">
        <div className="doc-type-icon-wrapper">
          {renderTypeIcon(fileType)}
        </div>
        <span className={`badge ${renderBadgeClass(fileType)}`}>
          {fileType}
        </span>
      </div>

      <div className="doc-card-body">
        <div className="doc-tags">
          <span className="badge badge-major">{major}</span>
          <span className="doc-subject">{subject}</span>
        </div>

        <h3 className="doc-title" title={title}>
          {title}
        </h3>
      </div>

      <div className="doc-card-footer">
        <div className="doc-meta-stats">
          <span className="doc-meta-item" title="Downloads">
            <Download size={14} />
            {downloads.toLocaleString()}
          </span>
          <span className="doc-meta-item rating" title="Rating">
            <Star size={14} className="star-icon" />
            {rating}
          </span>
        </div>
        <span className="doc-file-size">{fileSize}</span>
      </div>
    </Link>
  );
};

export default DocumentCard;
