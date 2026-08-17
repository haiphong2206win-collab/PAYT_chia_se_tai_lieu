import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import UploadZone from '../../components/document/UploadZone';
import { MAJORS, FILE_TYPES } from '../../utils/constants';
import './UploadDocument.css';

export const UploadDocument = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('Data Structures & Algorithms - Complete Lecture Notes 2026');
  const [description, setDescription] = useState('Comprehensive study guide covering Trees, Graphs, Sorting Algorithms, Dynamic Programming, and Complexity Analysis.');
  const [major, setMajor] = useState('Computer Science');
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [documentType, setDocumentType] = useState('PDF');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Phase 1 Demonstration: Document metadata submitted visually. Redirecting to Document Detail page...');
    navigate('/documents/doc-1');
  };

  return (
    <div className="payt-upload-page">
      <div className="container upload-container">
        {/* Page Header */}
        <div className="upload-page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="upload-title">Upload Document</h1>
          <p className="upload-subtitle">Share your study materials and help fellow students succeed.</p>
        </div>

        <form onSubmit={handleSubmit} className="upload-form-wrapper">
          {/* 1. Drag & Drop File Upload Zone */}
          <div className="upload-section">
            <h3 className="section-heading">1. Select Document File</h3>
            <UploadZone />
          </div>

          {/* 2. Document Details & Metadata Form */}
          <div className="upload-section payt-card form-card">
            <h3 className="section-heading">2. Document Information</h3>

            <div className="form-fields-grid">
              <Input
                label="Document Title"
                placeholder="e.g. Data Structures Midterm Exam Prep Notes 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                onChange={(e) => setMajor(e.target.value)}
                required
              />

              <Input
                label="Course / Subject"
                placeholder="e.g. Operating Systems"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />

              <Select
                label="Document Type"
                options={FILE_TYPES}
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
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
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={UploadCloud}
            >
              Upload Document
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocument;
