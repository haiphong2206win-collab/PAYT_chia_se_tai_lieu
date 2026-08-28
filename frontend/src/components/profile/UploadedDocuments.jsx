import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen,
  Upload,
  FileText,
  Download,
  Eye,
  Edit3,
  Trash2,
} from 'lucide-react';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';

export const UploadedDocuments = ({
  uploadedDocs,
  getCategoryName,
  onUploadMaterial,
  onEditDoc,
  onDeleteDoc,
}) => {
  return (
    <div className="payt-card profile-uploads-card">
      <div className="info-card-header">
        <h3 className="section-title">My Uploaded Documents</h3>
        <span className="uploads-count-badge">
          {uploadedDocs.length} items
        </span>
      </div>

      {uploadedDocs.length === 0 ? (
        <div className="empty-uploads">
          <FolderOpen size={48} className="text-orange" />
          <p className="empty-title">No uploaded documents yet</p>
          <p className="empty-subtext">
            Share your lecture notes or study guides with fellow students.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            onClick={onUploadMaterial}
          >
            Upload Your First Document
          </Button>
        </div>
      ) : (
        <div className="uploaded-list">
          {uploadedDocs.map((doc) => (
            <div key={doc.id} className="uploaded-item">
              <div className="uploaded-item-main">
                <div className="uploaded-file-icon">
                  <FileText size={22} className="text-orange" />
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
                    <span>• Uploaded {formatDate(doc.uploadDate)}</span>
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
                <button
                  type="button"
                  className="action-icon-btn"
                  title="Edit Document"
                  aria-label="Edit Document"
                  onClick={() => onEditDoc(doc)}
                >
                  <Edit3 size={16} />
                </button>
                <button
                  type="button"
                  className="action-icon-btn danger"
                  title="Delete Document"
                  aria-label="Delete Document"
                  onClick={() => onDeleteDoc(doc)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadedDocuments;
