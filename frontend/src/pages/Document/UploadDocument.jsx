import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  UploadCloud,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import UploadZone from '../../components/document/UploadZone';

import { getCategories } from '../../services/category.api';
import { uploadDocumentApi } from '../../services/document.api';

import './UploadDocument.css';

export const UploadDocument = () => {
  const navigate = useNavigate();

  // =====================================================
  // 1. FILE STATE
  // =====================================================

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [fileError, setFileError] =
    useState('');

  // =====================================================
  // 2. DOCUMENT FORM STATE
  // =====================================================

  const [title, setTitle] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [categoryId, setCategoryId] =
    useState('');

  // =====================================================
  // 3. CATEGORY STATE
  // =====================================================

  const [categories, setCategories] =
    useState([]);

  const [isLoadingCategories, setIsLoadingCategories] =
    useState(false);

  // =====================================================
  // 4. FORM STATE
  // =====================================================

  const [errors, setErrors] =
    useState({});

  const [isUploading, setIsUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [successMessage, setSuccessMessage] =
    useState('');

  // =====================================================
  // 5. LOAD CATEGORIES FROM BACKEND
  // =====================================================

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);

      try {
        const response =
          await getCategories();

        const categoryData =
          response.data ||
          response.categories ||
          [];

        setCategories(categoryData);
      } catch (error) {
        console.error(
          'Category API error:',
          error
        );

        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // =====================================================
  // 6. SELECT FILE
  // =====================================================

  const handleFileSelect = (
    fileData,
    err
  ) => {
    if (err) {
      setSelectedFile(null);
      setFileError(err);

      setErrors((prev) => ({
        ...prev,
        file: err,
      }));

      return;
    }

    setSelectedFile(fileData);
    setFileError('');

    setErrors((prev) => ({
      ...prev,
      file: '',
    }));

    setUploadProgress(0);
    setSuccessMessage('');

    // Nếu title đang trống
    // thì lấy tên file làm title mặc định.
    if (!title && fileData?.name) {
      const nameWithoutExt =
        fileData.name.substring(
          0,
          fileData.name.lastIndexOf('.')
        ) || fileData.name;

      setTitle(nameWithoutExt);

      setErrors((prev) => ({
        ...prev,
        title: '',
      }));
    }
  };

  // =====================================================
  // 7. REMOVE FILE
  // =====================================================

  const handleFileRemove = () => {
    setSelectedFile(null);
    setFileError('');

    setErrors((prev) => ({
      ...prev,
      file: '',
    }));

    setUploadProgress(0);
    setSuccessMessage('');
  };

  // =====================================================
  // 8. SUBMIT DOCUMENT TO BACKEND
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUploading) {
      return;
    }

    const newErrors = {};

    // FILE
    if (!selectedFile) {
      newErrors.file =
        'Please select a document file.';
    } else if (fileError) {
      newErrors.file =
        fileError;
    }

    // TITLE
    if (!title.trim()) {
      newErrors.title =
        'Document title is required.';
    }

    // CATEGORY
    if (!categoryId) {
      newErrors.categoryId =
        'Document category is required.';
    }

    // Nếu validation lỗi
    if (
      Object.keys(newErrors).length > 0
    ) {
      setErrors(newErrors);
      setSuccessMessage('');

      return;
    }

    setErrors({});
    setSuccessMessage('');
    setIsUploading(true);
    setUploadProgress(20);

    try {
      // =================================================
      // FormData dùng khi request có FILE
      // =================================================

      const formData =
        new FormData();

      formData.append(
        'title',
        title.trim()
      );

      formData.append(
        'description',
        description.trim()
      );

      formData.append(
        'categoryId',
        categoryId
      );

      /*
        UploadZone có thể trả File trực tiếp
        hoặc object có property file.

        Đoạn này hỗ trợ cả 2 trường hợp.
      */
      const actualFile =
        selectedFile.file ||
        selectedFile.rawFile ||
        selectedFile;

      formData.append(
        'file',
        actualFile
      );

      setUploadProgress(50);

      // ===============================================
      // POST /documents
      // ===============================================

      const response =
        await uploadDocumentApi(
          formData
        );

      setUploadProgress(100);

      setSuccessMessage(
        response.message ||
        'Document uploaded successfully!'
      );

      // Sau khi upload thành công
      // reset form
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setCategoryId('');
      setFileError('');

      // Có thể xem kết quả vài giây
      // rồi chuyển về Profile.
      setTimeout(() => {
        navigate('/profile');
      }, 1500);

    } catch (error) {
      console.error(
        'Upload Document API error:',
        error
      );

      setUploadProgress(0);

      setErrors((prev) => ({
        ...prev,

        submit:
          error.response?.data?.message ||
          'Unable to upload document.',
      }));

    } finally {
      setIsUploading(false);
    }
  };

  // =====================================================
  // 9. UI
  // =====================================================

  return (
    <div className="payt-upload-page">

      <div className="container upload-container">

        {/* PAGE HEADER */}

        <div className="upload-page-header">

          <button
            type="button"
            className="back-btn"
            onClick={() =>
              navigate(-1)
            }
          >
            <ArrowLeft size={16} />

            Back
          </button>

          <h1 className="upload-title">
            Upload Document
          </h1>

          <p className="upload-subtitle">
            Share your study materials
            and help fellow students
            succeed.
          </p>

        </div>

        {/* SUCCESS */}

        {successMessage && (

          <div className="upload-success-alert">

            <CheckCircle2
              size={20}
              className="success-icon"
            />

            <span>
              {successMessage}
            </span>

          </div>

        )}

        {/* BACKEND ERROR */}

        {errors.submit && (

          <div className="upload-error-alert">
            {errors.submit}
          </div>

        )}

        <form
          onSubmit={handleSubmit}
          className="upload-form-wrapper"
        >

          {/* ===========================================
              1. FILE
          =========================================== */}

          <div className="upload-section">

            <h3 className="section-heading">
              1. Select Document File
            </h3>

            <UploadZone
              selectedFile={
                selectedFile
              }
              onFileSelect={
                handleFileSelect
              }
              onFileRemove={
                handleFileRemove
              }
              error={
                errors.file ||
                fileError
              }
              isUploading={
                isUploading
              }
              uploadProgress={
                uploadProgress
              }
            />

          </div>

          {/* ===========================================
              2. DOCUMENT INFORMATION
          =========================================== */}

          <div className="upload-section payt-card form-card">

            <h3 className="section-heading">
              2. Document Information
            </h3>

            <div className="form-fields-grid">

              {/* TITLE */}

              <Input
                label="Document Title"
                placeholder="e.g. Data Structures Midterm Exam Prep Notes 2026"
                value={title}
                onChange={(e) => {

                  setTitle(
                    e.target.value
                  );

                  if (errors.title) {
                    setErrors(
                      (prev) => ({
                        ...prev,
                        title: '',
                      })
                    );
                  }

                }}
                error={
                  errors.title
                }
                required
                className="full-width-field"
              />

              {/* DESCRIPTION */}

              <div className="payt-input-group full-width-field">

                <label className="payt-input-label">
                  Description
                </label>

                <textarea
                  className="payt-textarea"
                  rows={4}
                  placeholder="Provide a detailed summary of what this document contains..."
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* CATEGORY */}

              <div className="payt-input-group">

                <label className="payt-input-label">

                  Document Category
                  <span className="required">
                    {' '}*
                  </span>

                </label>

                <select
                  className="payt-input"
                  value={categoryId}
                  disabled={
                    isLoadingCategories
                  }
                  onChange={(e) => {

                    setCategoryId(
                      e.target.value
                    );

                    if (
                      errors.categoryId
                    ) {
                      setErrors(
                        (prev) => ({
                          ...prev,
                          categoryId:
                            '',
                        })
                      );
                    }

                  }}
                >

                  <option value="">
                    {isLoadingCategories
                      ? 'Loading categories...'
                      : 'Select category'}
                  </option>

                  {categories.map(
                    (category) => (

                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >

                        {category.title ||
                          category.name ||
                          category.slug ||
                          'Category'}

                      </option>

                    )
                  )}

                </select>

                {errors.categoryId && (
                  <span className="payt-input-error">
                    {errors.categoryId}
                  </span>
                )}

              </div>

            </div>

          </div>

          {/* ===========================================
              ACTIONS
          =========================================== */}

          <div className="upload-actions-bar">

            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() =>
                navigate(-1)
              }
              disabled={
                isUploading
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={UploadCloud}
              disabled={
                isUploading
              }
            >

              {isUploading
                ? `Uploading (${uploadProgress}%)...`
                : 'Upload Document'}

            </Button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default UploadDocument;