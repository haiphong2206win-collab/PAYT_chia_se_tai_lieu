import {
  Download,
  Bookmark,
  BookmarkCheck,
  Share2,
} from 'lucide-react';

import Button from '../../common/Button';
import { formatFileType } from '../../../utils/formatters';

export const DocumentActionsCard = ({
  document,
  isDownloading,
  isSaved,
  isCheckingSaved,
  isSavingLibrary,
  handleDownloadClick,
  handleSaveLibrary,
  handleShareClick,
}) => {
  if (!document) {
    return null;
  }

  // Chỉ format để hiển thị UI.
  // Không thay đổi giá trị fileType thật lấy từ Backend.
  const displayFileType = formatFileType(
    document.fileType
  );

  return (
    <div className="payt-card action-card">
      <h3 className="action-card-title">
        Document Actions
      </h3>

      <div className="action-meta-summary">
        {/* FILE FORMAT */}
        <div className="summary-row">
          <span className="label">
            File Format:
          </span>

          <span className="value">
            {displayFileType}
          </span>
        </div>

        {/* FILE SIZE */}
        <div className="summary-row">
          <span className="label">
            File Size:
          </span>

          <span className="value">
            {document.fileSize}
          </span>
        </div>

        {/* TOTAL PAGES */}
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

        {/* STATUS */}
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
          icon={Download}
          loading={isDownloading}
          onClick={handleDownloadClick}
          disabled={isDownloading}
        >
          {isDownloading
            ? 'Preparing...'
            : 'Download Document'}
        </Button>

        {/* SAVE */}
        <Button
          variant={isSaved ? 'outline' : 'secondary'}
          size="md"
          fullWidth
          icon={isSaved ? BookmarkCheck : Bookmark}
          loading={isSavingLibrary}
          disabled={
            isSavingLibrary ||
            isCheckingSaved
          }
          onClick={handleSaveLibrary}
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

      {/* SHARE */}
      <div className="action-card-footer">
        <button
          type="button"
          className="share-btn"
          onClick={handleShareClick}
        >
          <Share2 size={14} />
          Share Document
        </button>
      </div>
    </div>
  );
};

export default DocumentActionsCard;