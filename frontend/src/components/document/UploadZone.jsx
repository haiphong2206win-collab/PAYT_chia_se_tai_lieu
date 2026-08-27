import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, X, RefreshCw, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import './UploadZone.css';

export const UploadZone = ({
  selectedFile = null,
  onFileSelect = () => {},
  onFileRemove = () => {},
  error = '',
  isUploading = false,
  uploadProgress = 0
}) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateAndProcessFile = (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      onFileSelect(
        null,
        `Invalid file format (.${ext.toUpperCase()}). Allowed formats: PDF, DOC, DOCX, PPT, PPTX.`
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      onFileSelect(null, 'File size exceeds maximum limit of 10 MB.');
      return;
    }

    const formattedSize =
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

    const formattedType = ext.toUpperCase();

    const fileData = {
      name: file.name,
      type: formattedType,
      size: formattedSize,
      rawFile: file
    };

    onFileSelect(fileData, null);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  return (
    <div className="payt-upload-zone-wrapper">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.ppt,.pptx"
        onChange={handleFileInputChange}
      />

      {!selectedFile ? (
        <>
          <div
            className={`payt-dropzone payt-card ${isDragOver ? 'drag-over' : ''} ${error ? 'has-error' : ''}`}
            onClick={openFilePicker}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="dropzone-icon-circle">
              <UploadCloud size={36} className="upload-cloud-icon" />
            </div>
            <h3 className="dropzone-title">Drag & drop your file here</h3>
            <p className="dropzone-subtitle">or click to browse from your device</p>
            <div className="dropzone-meta">
              <span>Supported formats: PDF, DOC, DOCX, PPT, PPTX</span>
              <span>Maximum file size: 10MB</span>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="dropzone-btn"
              onClick={(e) => {
                e.stopPropagation();
                openFilePicker();
              }}
            >
              Browse Files
            </Button>
          </div>
          {error && (
            <div className="upload-zone-error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}
        </>
      ) : (
        <div
          className="payt-selected-file-card payt-card"
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="selected-file-header">
            <div className="selected-file-info">
              <div className="file-icon-box">
                <FileText size={24} className="text-orange" />
              </div>
              <div className="file-details">
                <h4 className="file-name">{selectedFile.name}</h4>
                <div className="file-badges">
                  <span className="badge badge-pdf">{selectedFile.type}</span>
                  <span className="file-size">{selectedFile.size}</span>
                </div>
              </div>
            </div>

            <div className="selected-file-actions">
              <button
                type="button"
                className="icon-action-btn"
                onClick={openFilePicker}
                title="Replace File"
                aria-label="Replace File"
                disabled={isUploading}
              >
                <RefreshCw size={16} />
              </button>
              <button
                type="button"
                className="icon-action-btn danger"
                onClick={onFileRemove}
                title="Remove File"
                aria-label="Remove File"
                disabled={isUploading}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Upload Progress Bar */}
          <div className="upload-progress-container">
            <div className="progress-status-row">
              <span className="progress-status">
                {isUploading ? (
                  'Uploading...'
                ) : uploadProgress === 100 ? (
                  <>
                    <CheckCircle2 size={14} className="success-icon" /> Upload Complete
                  </>
                ) : (
                  'Ready to upload'
                )}
              </span>
              <span className="progress-percentage">{uploadProgress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
