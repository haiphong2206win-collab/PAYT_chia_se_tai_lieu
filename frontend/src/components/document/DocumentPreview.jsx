import { useState } from 'react';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import './DocumentPreview.css';

export const DocumentPreview = ({ document }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const totalPages = document?.pages || 45;

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="payt-document-preview-container payt-card">
      {/* Control Bar */}
      <div className="preview-toolbar">
        <div className="preview-page-info">
          <FileText size={16} className="text-orange" />
          <span>Page <strong>{currentPage}</strong> of {totalPages}</span>
        </div>

        <div className="preview-controls">
          <button
            className="preview-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="page-number-badge">{currentPage}</span>
          <button
            className="preview-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight size={18} />
          </button>
          <div className="toolbar-divider"></div>
          <button
            className="preview-btn"
            onClick={() => setZoomLevel(Math.max(75, zoomLevel - 25))}
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="zoom-text">{zoomLevel}%</span>
          <button
            className="preview-btn"
            onClick={() => setZoomLevel(Math.min(150, zoomLevel + 25))}
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      {/* Realistic Document Preview Viewport */}
      <div className="preview-viewport">
        <div
          className="preview-paper-sheet"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          <div className="paper-header">
            <span className="paper-doc-title">{document?.title || 'Lecture Note Preview'}</span>
            <span className="paper-page-num">{currentPage} / {totalPages}</span>
          </div>

          <div className="paper-content-mock">
            <h2>{document?.subject || 'Course Material'} - Chapter {currentPage}</h2>
            <div className="paper-line lg"></div>
            <div className="paper-line full"></div>
            <div className="paper-line full"></div>
            <div className="paper-line md"></div>

            <div className="paper-diagram-box">
              <div className="diagram-circle"></div>
              <span className="diagram-label">Figure {currentPage}.1: Architectural Model Overview</span>
            </div>

            <div className="paper-line full"></div>
            <div className="paper-line full"></div>
            <div className="paper-line sm"></div>
          </div>

          <div className="paper-watermark">
            <span>PayT Academic Preview</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
