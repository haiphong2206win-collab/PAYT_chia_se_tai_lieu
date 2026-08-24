import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import UploadZone from '../../components/document/UploadZone';
import { MAJORS, FILE_TYPES } from '../../utils/constants';
import './UploadDocument.css';

export const UploadDocument = () => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [major, setMajor] = useState('');
  const [subject, setSubject] = useState('');
  const [documentType, setDocumentType] = useState('');

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileSelect = (fileData, err) => {
    if (err) {
      setSelectedFile(null);
      setFileError(err);
      setErrors((prev) => ({ ...prev, file: err }));
    } else {
      setSelectedFile(fileData);
      setFileError('');
      setErrors((prev) => ({ ...prev, file: '' }));
      setUploadProgress(0);
      setSuccessMessage('');

      if (!title && fileData?.name) {
        const nameWithoutExt = fileData.name.substring(0, fileData.name.lastIndexOf('.')) || fileData.name;
        setTitle(nameWithoutExt);
        setErrors((prev) => ({ ...prev, title: '' }));
      }
      if (!documentType && fileData?.type) {
        const matched = FILE_TYPES.find(
          (t) => t.toUpperCase() === fileData.type.toUpperCase()
        );
        if (matched) {
          setDocumentType(matched);
          setErrors((prev) => ({ ...prev, documentType: '' }));
        }
      }
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setFileError('');
    setErrors((prev) => ({ ...prev, file: '' }));
    setUploadProgress(0);
    setSuccessMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isUploading) return;

    const newErrors = {};

    if (!selectedFile) {
      newErrors.file = 'Please select a document file.';
    } else if (fileError) {
      newErrors.file = fileError;
    }

    if (!title.trim()) {
      newErrors.title = 'Document title is required.';
    }

    if (!major) {
      newErrors.major = 'Academic major is required.';
    }

    if (!subject.trim()) {
      newErrors.subject = 'Course / Subject is required.';
    }

    if (!documentType) {
      newErrors.documentType = 'Document type is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccessMessage('');
      return;
    }

    setErrors({});
    setSuccessMessage('');
    setIsUploading(true);
    setUploadProgress(0);

    setTimeout(() => setUploadProgress(30), 200);
    setTimeout(() => setUploadProgress(60), 500);
    setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);
      setSuccessMessage('Document uploaded successfully');
    }, 800);
  };

  return (
    <div className="payt-upload-page">
      <div className="container upload-container">
        {/* Page Header */}
        <div className="upload-page-header">
          <button type="button" className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="upload-title">Upload Document</h1>
          <p className="upload-subtitle">Share your study materials and help fellow students succeed.</p>
        </div>

        {successMessage && (
          <div className="upload-success-alert">
            <CheckCircle2 size={20} className="success-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form-wrapper">
          {/* 1. Drag & Drop File Upload Zone */}
          <div className="upload-section">
            <h3 className="section-heading">1. Select Document File</h3>
            <UploadZone
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              error={errors.file || fileError}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          </div>

          {/* 2. Document Details & Metadata Form */}
          <div className="upload-section payt-card form-card">
            <h3 className="section-heading">2. Document Information</h3>

            <div className="form-fields-grid">
              <Input
                label="Document Title"
                placeholder="e.g. Data Structures Midterm Exam Prep Notes 2026"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
                error={errors.title}
                required
                className="full-width-field"
              />

              <div className="payt-input-group full-width-field">
                <label className="payt-input-label">Description</label>
                <textarea
                  className="payt-textarea"
                  rows={4}
                  placeholder="Provide a detailed summary of what this document contains..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Select
                label="Academic Major"
                options={MAJORS}
                value={major}
                onChange={(e) => {
                  setMajor(e.target.value);
                  if (errors.major) setErrors((prev) => ({ ...prev, major: '' }));
                }}
                error={errors.major}
                required
              />

              <Input
                label="Course / Subject"
                placeholder="e.g. Operating Systems"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }));
                }}
                error={errors.subject}
                required
              />

              <Select
                label="Document Type"
                options={FILE_TYPES}
                value={documentType}
                onChange={(e) => {
                  setDocumentType(e.target.value);
                  if (errors.documentType) setErrors((prev) => ({ ...prev, documentType: '' }));
                }}
                error={errors.documentType}
                required
              />
            </div>
          </div>

          {/* Form Action Controls */}
          <div className="upload-actions-bar">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate(-1)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={UploadCloud}
              disabled={isUploading}
            >
              {isUploading ? `Uploading (${uploadProgress}%)...` : 'Upload Document'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocument;
