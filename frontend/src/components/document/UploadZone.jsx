import { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, X, RefreshCw } from 'lucide-react';
import Button from '../common/Button';
import './UploadZone.css';

export const UploadZone = () => {
  const [selectedFile, setSelectedFile] = useState({
    name: 'CS301_Data_Structures_Lecture_Notes_2026.pdf',
    type: 'PDF',
    size: '4.8 MB',
    progress: 100
  });

  const handleClearFile = () => {
    setSelectedFile(null);
  };

  const handleSimulateSelect = () => {
    setSelectedFile({
      name: 'Business_Strategy_Case_Study_2026.pptx',
      type: 'Slides',
      size: '12.4 MB',
      progress: 100
    });
  };

  return (
    <div className="payt-upload-zone-wrapper">
      {!selectedFile ? (
        <div className="payt-dropzone payt-card" onClick={handleSimulateSelect}>
          <div className="dropzone-icon-circle">
            <UploadCloud size={36} className="upload-cloud-icon" />
          </div>
          <h3 className="dropzone-title">Drag & drop your file here</h3>
          <p className="dropzone-subtitle">or click to browse from your device</p>
          <div className="dropzone-meta">
            <span>Supported formats: PDF, PPTX, DOCX, TXT</span>
            <span>Maximum file size: 50MB</span>
          </div>
          <Button variant="secondary" size="sm" className="dropzone-btn">
            Browse Files
          </Button>
        </div>
      ) : (
        <div className="payt-selected-file-card payt-card">
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
              <button className="icon-action-btn" onClick={handleSimulateSelect} title="Replace File">
                <RefreshCw size={16} />
              </button>
              <button className="icon-action-btn danger" onClick={handleClearFile} title="Remove File">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Upload Progress Bar */}
          <div className="upload-progress-container">
            <div className="progress-status-row">
              <span className="progress-status">
                <CheckCircle2 size={14} className="success-icon" /> Upload Complete
              </span>
              <span className="progress-percentage">{selectedFile.progress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${selectedFile.progress}%` }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
