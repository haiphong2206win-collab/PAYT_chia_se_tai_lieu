import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bookmark, Download, Eye } from 'lucide-react';
import Button from '../common/Button';

export const SavedDocuments = ({
  savedDocs,
  isLoadingSavedDocs,
  savedDocsError,
  getCategoryName,
  onBrowseDocuments,
}) => {
  return (
    <div className="payt-card profile-uploads-card">
      <div className="info-card-header">
        <h3 className="section-title">Saved Documents</h3>
        <span className="uploads-count-badge">
          {savedDocs.length} items
        </span>
      </div>

      {isLoadingSavedDocs ? (
        <div className="empty-uploads">
          <p className="empty-title">Loading saved documents...</p>
        </div>
      ) : savedDocsError ? (
        <div className="empty-uploads">
          <AlertTriangle size={42} className="warning-icon" />
          <p className="empty-title">Unable to load saved documents</p>
          <p className="empty-subtext">{savedDocsError}</p>
        </div>
      ) : savedDocs.length === 0 ? (
        <div className="empty-uploads">
          <Bookmark size={48} className="text-orange" />
          <p className="empty-title">No saved documents yet</p>
          <p className="empty-subtext">
            Documents you save will appear here.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={onBrowseDocuments}
          >
            Browse Documents
          </Button>
        </div>
      ) : (
        <div className="uploaded-list">
          {savedDocs.map((doc) => (
            <div key={doc.id} className="uploaded-item">
              <div className="uploaded-item-main">
                <div className="uploaded-file-icon">
                  <Bookmark size={22} className="text-orange" />
                </div>
                <div className="uploaded-file-text">
                  <Link to={`/documents/${doc.id}`} className="uploaded-title">
                    {doc.title}
                  </Link>
                  <div className="uploaded-submeta">
                    <span className="badge badge-major">
                      {getCategoryName(doc.categoryId, doc.major)}
                    </span>
                    <span>• {doc.fileSize}</span>
                    {doc.uploaderName && (
                      <span>• By {doc.uploaderName}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="uploaded-item-actions">
                <div className="uploaded-dl-count">
                  <Download size={14} /> {doc.downloads}
                </div>
                <Link to={`/documents/${doc.id}`}>
                  <button
                    type="button"
                    className="action-icon-btn"
                    title="View Document"
                    aria-label="View Document"
                  >
                    <Eye size={16} />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedDocuments;
