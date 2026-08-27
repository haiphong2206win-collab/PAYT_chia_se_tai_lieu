import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  Shield,
  FileText,
  Download,
  Eye,
  Edit3,
  Trash2,
  LogOut,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Bookmark,
} from 'lucide-react';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

// =====================================================
// USER API
// =====================================================

import {
  getUserProfileApi,
  updateUserProfileApi,
  getMyDocumentsApi,
  getSavedDocumentsApi,
} from '../../services/user.api';

// =====================================================
// DOCUMENT API
// =====================================================

import {
  updateDocumentApi,
  deleteDocumentApi,
} from '../../services/document.api';

// =====================================================
// CATEGORY API
// =====================================================

import {
  getCategories,
} from '../../services/category.api';

// =====================================================
// AUTH API
// =====================================================

import {
  logoutApi,
} from '../../services/auth.api';

import {
  MOCK_USER,
} from '../../mock/user';

import {
  formatDate,
} from '../../utils/formatters';

import './Profile.css';

// =====================================================
// HELPER: FORMAT FILE SIZE
// =====================================================
//
// Backend trả file_size bằng bytes.
// FE chuyển sang KB / MB để hiển thị.
//
// =====================================================

const formatFileSize = (bytes) => {
  const size = Number(bytes || 0);

  if (!size) {
    return '0 KB';
  }

  if (size >= 1024 * 1024) {
    return `${(
      size /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  }

  return `${(
    size /
    1024
  ).toFixed(2)} KB`;
};

// =====================================================
// HELPER: MAP BACKEND DOCUMENT → UI DOCUMENT
// =====================================================
//
// Dùng chung cho:
//
// GET /users/my-documents
// GET /users/saved-document
//
// Backend dùng snake_case.
// UI hiện tại dùng một số field khác.
//
// Ví dụ:
//
// Backend:
// category_id
// file_size
// download_count
//
// UI:
// categoryId
// fileSize
// downloads
//
// =====================================================

const mapBackendDocument = (doc) => ({
  // ===================================================
  // DOCUMENT ID
  // ===================================================

  id:
    doc.id ||
    doc.document_id,

  // ===================================================
  // TITLE
  // ===================================================

  title:
    doc.title ||
    'Untitled Document',

  // ===================================================
  // CATEGORY NAME
  // ===================================================
  //
  // My Documents có category_title.
  //
  // Saved Documents hiện chỉ có category_id,
  // nên nếu không có title thì tạm fallback.
  //
  // Sau đó getCategoryName() sẽ lấy tên thật
  // từ danh sách GET /category.
  //
  // ===================================================

  major:
    doc.category_title ||
    doc.categoryTitle ||
    doc.category_name ||
    doc.categoryName ||
    doc.category?.title ||
    doc.category?.name ||
    doc.document?.category_title ||
    doc.document?.categoryTitle ||
    doc.document?.category_name ||
    doc.document?.categoryName ||
    doc.document?.category?.title ||
    doc.document?.category?.name ||
    'Uncategorized',

  // Backend hiện chưa có subject tương ứng
  subject: '',

  // ===================================================
  // FILE SIZE
  // ===================================================

  fileSize:
    formatFileSize(
      doc.file_size
    ),

  // ===================================================
  // UPLOAD DATE
  // ===================================================

  uploadDate:
    doc.created_at,

  // ===================================================
  // DOWNLOAD COUNT
  // ===================================================

  downloads:
    Number(
      doc.download_count
    ) || 0,

  // ===================================================
  // CATEGORY ID
  // ===================================================
  //
  // Rất quan trọng cho Saved Documents.
  //
  // Saved Documents API trả:
  //
  // category_id: "..."
  //
  // FE dùng ID này để tìm tên Category.
  //
  // ===================================================

  categoryId:
    doc.category_id,

  // ===================================================
  // DESCRIPTION
  // ===================================================

  description:
    doc.description || '',

  // ===================================================
  // FILE TYPE
  // ===================================================

  fileType:
    doc.file_type,

  // ===================================================
  // FILE URL
  // ===================================================

  fileUrl:
    doc.file_url,

  // ===================================================
  // STATUS
  // ===================================================

  status:
    doc.status,

  // ===================================================
  // VIEW COUNT
  // ===================================================

  views:
    Number(
      doc.view_count
    ) || 0,

  // ===================================================
  // REVIEW COUNT
  // ===================================================

  reviewCount:
    Number(
      doc.review_count
    ) || 0,

  // ===================================================
  // AVERAGE RATING
  // ===================================================

  averageRating:
    Number(
      doc.average_rating
    ) || 0,

  // ===================================================
  // UPLOADER NAME
  // ===================================================

  uploaderName:
    doc.uploader_name ||
    doc.full_name ||
    '',
});

// =====================================================
// PROFILE COMPONENT
// =====================================================

export const Profile = () => {
  const navigate =
    useNavigate();

  // =====================================================
  // 1. USER PROFILE STATE
  // =====================================================

  const [
    userProfile,
    setUserProfile,
  ] = useState({
    fullName:
      MOCK_USER.fullName,

    email:
      MOCK_USER.email,

    role:
      MOCK_USER.role,

    joinedDate:
      MOCK_USER.joinedDate,

    avatar:
      MOCK_USER.avatar,

    stats: {
      ...MOCK_USER.stats,
    },
  });

  // =====================================================
  // 2. LOAD USER PROFILE
  // =====================================================
  //
  // GET /users/profile
  //
  // =====================================================

  useEffect(() => {
    const fetchUserProfile =
      async () => {
        try {
          const response =
            await getUserProfileApi();

          console.log(
            'Profile API response:',
            response
          );

          const profile =
            response.user ||
            response.data ||
            response;

          setUserProfile(
            (prev) => ({
              ...prev,

              fullName:
                profile.fullName ||
                profile.full_name ||
                prev.fullName,

              email:
                profile.email ||
                prev.email,

              avatar:
                profile.avatar ||
                prev.avatar,

              role:
                profile.role ||
                prev.role,

              joinedDate:
                profile.joinedDate ||
                profile.joined_date ||
                profile.created_at ||
                prev.joinedDate,
            })
          );
        } catch (error) {
          console.error(
            'Profile API error:',
            error
          );
        }
      };

    fetchUserProfile();
  }, []);

  // =====================================================
  // 3. MY UPLOADED DOCUMENTS STATE
  // =====================================================

  const [
    uploadedDocs,
    setUploadedDocs,
  ] = useState([]);

  // =====================================================
  // 4. LOAD MY UPLOADED DOCUMENTS
  // =====================================================
  //
  // GET /users/my-documents
  //
  // =====================================================

  const loadMyDocuments =
    useCallback(
      async () => {
        try {
          const response =
            await getMyDocumentsApi();

          console.log(
            'My Documents API response:',
            response
          );

          const documents =
            response.documents ||
            response.data ||
            [];

          const mappedDocuments =
            documents.map(
              mapBackendDocument
            );

          setUploadedDocs(
            mappedDocuments
          );
        } catch (error) {
          console.error(
            'My Documents API error:',
            error
          );

          setUploadedDocs([]);
        }
      },
      []
    );

  useEffect(() => {
    loadMyDocuments();
  }, [loadMyDocuments]);

  // =====================================================
  // 5. SAVED DOCUMENTS STATE
  // =====================================================
  //
  // uploadedDocs
  // = tài liệu do user upload.
  //
  // savedDocs
  // = tài liệu user bấm Save to Library.
  //
  // =====================================================

  const [
    savedDocs,
    setSavedDocs,
  ] = useState([]);

  const [
    isLoadingSavedDocs,
    setIsLoadingSavedDocs,
  ] = useState(true);

  const [
    savedDocsError,
    setSavedDocsError,
  ] = useState('');

  // =====================================================
  // 6. LOAD SAVED DOCUMENTS
  // =====================================================
  //
  // GET /users/saved-document
  //
  // Backend thực tế trả:
  //
  // {
  //   message: "...",
  //   savedDocuments: [...],
  //   pagination: {...}
  // }
  //
  // =====================================================

  const loadSavedDocuments =
    useCallback(
      async () => {
        setIsLoadingSavedDocs(true);
        setSavedDocsError('');

        try {
          const response =
            await getSavedDocumentsApi();

          console.log(
            'Saved Documents API response:',
            response
          );

          // ===============================================
          // LẤY ARRAY DOCUMENT ĐÚNG TỪ RESPONSE
          // ===============================================
          //
          // Backend thực tế:
          // response.savedDocuments
          //
          // Các fallback bên dưới giữ để code an toàn.
          //
          // ===============================================

          const documents =
            response.savedDocuments ||
            response.documents ||
            response.data?.savedDocuments ||
            response.data?.documents ||
            (
              Array.isArray(
                response.data
              )
                ? response.data
                : []
            );

          const mappedDocuments =
            documents.map(
              mapBackendDocument
            );

          setSavedDocs(
            mappedDocuments
          );
        } catch (error) {
          console.error(
            'Saved Documents API error:',
            error
          );

          setSavedDocs([]);

          setSavedDocsError(
            error.response
              ?.data
              ?.message ||
            'Unable to load saved documents.'
          );
        } finally {
          setIsLoadingSavedDocs(
            false
          );
        }
      },
      []
    );

  // Khi Profile mở
  // → tự động load Saved Documents.

  useEffect(() => {
    loadSavedDocuments();
  }, [loadSavedDocuments]);

  // =====================================================
  // 7. CATEGORY STATE
  // =====================================================

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    isLoadingCategories,
    setIsLoadingCategories,
  ] = useState(false);

  // =====================================================
  // 8. LOAD CATEGORY
  // =====================================================
  //
  // GET /category
  //
  // Backend trả danh sách Category thật.
  //
  // =====================================================

  useEffect(() => {
    const fetchCategories =
      async () => {
        setIsLoadingCategories(
          true
        );

        try {
          const response =
            await getCategories();

          console.log(
            'Profile Category API response:',
            response
          );

          const data =
            response.data ||
            response.categories ||
            [];

          setCategories(data);
        } catch (error) {
          console.error(
            'Category API error:',
            error
          );

          setCategories([]);
        } finally {
          setIsLoadingCategories(
            false
          );
        }
      };

    fetchCategories();
  }, []);

  // =====================================================
  // 9. GET CATEGORY NAME FROM CATEGORY ID
  // =====================================================
  //
  // Đây là phần sửa lỗi:
  //
  // Saved Documents API chỉ trả:
  //
  // category_id
  //
  // chứ KHÔNG trả:
  //
  // category_title
  //
  // Vì vậy:
  //
  // category_id
  // ↓
  // tìm trong categories
  // ↓
  // category.id === categoryId
  // ↓
  // lấy category.title
  //
  // =====================================================

  const getCategoryName = (
    categoryId,
    fallback
  ) => {
    const category =
      categories.find(
        (item) =>
          item.id === categoryId
      );

    return (
      category?.title ||
      category?.name ||
      category?.slug ||
      fallback ||
      'Uncategorized'
    );
  };

  // =====================================================
  // 10. EDIT PROFILE STATE
  // =====================================================

  const [
    editProfileOpen,
    setEditProfileOpen,
  ] = useState(false);

  const [
    profileDraft,
    setProfileDraft,
  ] = useState({
    fullName: '',
    email: '',
    avatar: '',
  });

  const [
    profileError,
    setProfileError,
  ] = useState('');

  const [
    profileSuccess,
    setProfileSuccess,
  ] = useState('');

  const [
    isSavingProfile,
    setIsSavingProfile,
  ] = useState(false);

  // =====================================================
  // 11. EDIT DOCUMENT STATE
  // =====================================================

  const [
    editDocModal,
    setEditDocModal,
  ] = useState(null);

  const [
    docDraft,
    setDocDraft,
  ] = useState({
    title: '',
    description: '',
    categoryId: '',
  });

  const [
    docError,
    setDocError,
  ] = useState('');

  const [
    isSavingDoc,
    setIsSavingDoc,
  ] = useState(false);

  // =====================================================
  // 12. DELETE DOCUMENT STATE
  // =====================================================

  const [
    deleteModalDoc,
    setDeleteModalDoc,
  ] = useState(null);

  const [
    isDeletingDoc,
    setIsDeletingDoc,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState('');

  // =====================================================
  // 13. LOGOUT STATE
  // =====================================================

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  // =====================================================
  // 14. OPEN EDIT PROFILE
  // =====================================================

  const handleOpenEditProfile =
    () => {
      setProfileDraft({
        fullName:
          userProfile.fullName,

        email:
          userProfile.email,

        avatar:
          userProfile.avatar,
      });

      setProfileError('');
      setEditProfileOpen(true);
    };

  // =====================================================
  // 15. SAVE PROFILE
  // =====================================================
  //
  // PATCH /users/profile
  //
  // =====================================================

  const handleSaveProfile =
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      if (
        !profileDraft
          .fullName
          .trim()
      ) {
        setProfileError(
          'Full Name is required.'
        );

        return;
      }

      if (isSavingProfile) {
        return;
      }

      setIsSavingProfile(true);
      setProfileError('');

      try {
        const userData = {
          fullName:
            profileDraft
              .fullName
              .trim(),

          email:
            profileDraft
              .email
              .trim(),

          avatar:
            profileDraft
              .avatar
              .trim(),
        };

        // PATCH /users/profile
        const response =
          await updateUserProfileApi(
            userData
          );

        console.log(
          'Update Profile API response:',
          response
        );

        // Sau PATCH
        // GET lại dữ liệu thật.
        const profileResponse =
          await getUserProfileApi();

        const updatedProfile =
          profileResponse.user ||
          profileResponse.data ||
          profileResponse;

        setUserProfile(
          (prev) => ({
            ...prev,

            fullName:
              updatedProfile.fullName ||
              updatedProfile.full_name ||
              profileDraft
                .fullName
                .trim(),

            email:
              updatedProfile.email ||
              profileDraft
                .email
                .trim() ||
              prev.email,

            avatar:
              updatedProfile.avatar ||
              profileDraft
                .avatar
                .trim() ||
              prev.avatar,

            role:
              updatedProfile.role ||
              prev.role,

            joinedDate:
              updatedProfile.joinedDate ||
              updatedProfile.joined_date ||
              updatedProfile.created_at ||
              prev.joinedDate,
          })
        );

        setEditProfileOpen(
          false
        );

        setProfileSuccess(
          response.message ||
          'Profile updated successfully!'
        );

        setTimeout(() => {
          setProfileSuccess('');
        }, 3000);
      } catch (error) {
        console.error(
          'Update Profile API error:',
          error
        );

        setProfileError(
          error.response
            ?.data
            ?.message ||
          'Unable to update profile.'
        );
      } finally {
        setIsSavingProfile(
          false
        );
      }
    };

  // =====================================================
  // 16. OPEN EDIT DOCUMENT
  // =====================================================

  const handleOpenEditDoc =
    (doc) => {
      setEditDocModal(doc);

      setDocDraft({
        title:
          doc.title || '',

        description:
          doc.description || '',

        categoryId:
          doc.categoryId || '',
      });

      setDocError('');
    };

  // =====================================================
  // 17. SAVE DOCUMENT
  // =====================================================
  //
  // PATCH /documents/:documentId
  //
  // =====================================================

  const handleSaveDoc =
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      if (!editDocModal) {
        return;
      }

      if (
        !docDraft
          .title
          .trim()
      ) {
        setDocError(
          'Document title is required.'
        );

        return;
      }

      if (
        !docDraft.categoryId
      ) {
        setDocError(
          'Document category is required.'
        );

        return;
      }

      if (isSavingDoc) {
        return;
      }

      setIsSavingDoc(true);
      setDocError('');

      try {
        const documentData = {
          title:
            docDraft
              .title
              .trim(),

          description:
            docDraft
              .description
              .trim(),

          categoryId:
            docDraft
              .categoryId,
        };

        console.log(
          'Update Document payload:',
          documentData
        );

        // PATCH /documents/:documentId
        const response =
          await updateDocumentApi(
            editDocModal.id,
            documentData
          );

        console.log(
          'Update Document API response:',
          response
        );

        // GET lại My Documents thật
        await loadMyDocuments();

        setEditDocModal(null);

        setProfileSuccess(
          response.message ||
          'Document updated successfully!'
        );

        setTimeout(() => {
          setProfileSuccess('');
        }, 3000);
      } catch (error) {
        console.error(
          'Update Document API error:',
          error
        );

        setDocError(
          error.response
            ?.data
            ?.message ||
          'Unable to update document.'
        );
      } finally {
        setIsSavingDoc(false);
      }
    };

  // =====================================================
  // 18. OPEN DELETE DOCUMENT
  // =====================================================

  const handleOpenDeleteDoc =
    (doc) => {
      setDeleteError('');
      setDeleteModalDoc(doc);
    };

  // =====================================================
  // 19. DELETE DOCUMENT
  // =====================================================
  //
  // DELETE /documents/:documentId
  //
  // =====================================================

  const handleConfirmDelete =
    async () => {
      if (!deleteModalDoc) {
        return;
      }

      if (isDeletingDoc) {
        return;
      }

      setIsDeletingDoc(true);
      setDeleteError('');

      try {
        // DELETE /documents/:documentId
        const response =
          await deleteDocumentApi(
            deleteModalDoc.id
          );

        console.log(
          'Delete Document API response:',
          response
        );

        // GET lại danh sách thật
        await loadMyDocuments();

        // Nếu document đó từng được Save,
        // load lại Saved Documents luôn.
        await loadSavedDocuments();

        setDeleteModalDoc(null);

        setProfileSuccess(
          response.message ||
          'Document deleted successfully!'
        );

        setTimeout(() => {
          setProfileSuccess('');
        }, 3000);
      } catch (error) {
        console.error(
          'Delete Document API error:',
          error
        );

        setDeleteError(
          error.response
            ?.data
            ?.message ||
          'Unable to delete document.'
        );
      } finally {
        setIsDeletingDoc(false);
      }
    };

  // =====================================================
  // 20. CLOSE DELETE MODAL
  // =====================================================

  const handleCloseDeleteModal =
    () => {
      if (isDeletingDoc) {
        return;
      }

      setDeleteModalDoc(null);
      setDeleteError('');
    };

  // =====================================================
  // 21. LOGOUT
  // =====================================================
  //
  // POST /auth/logout
  //
  // =====================================================

  const handleLogout =
    async () => {
      if (isLoggingOut) {
        return;
      }

      setIsLoggingOut(true);

      try {
        const response =
          await logoutApi();

        console.log(
          'Logout API response:',
          response
        );

        navigate('/login');
      } catch (error) {
        console.error(
          'Logout API error:',
          error
        );
      } finally {
        setIsLoggingOut(false);
      }
    };

  // =====================================================
  // 22. UI
  // =====================================================

  return (
    <div className="payt-profile-page">

      {/* =================================================
          PROFILE BANNER
      ================================================= */}

      <div className="profile-banner sunrise-bg-soft">

        <div className="container profile-banner-container">

          <div className="profile-avatar-wrap">

            <img
              src={
                userProfile.avatar
              }
              alt={
                userProfile.fullName
              }
              className="profile-avatar"
            />

            <div className="avatar-badge">

              <CheckCircle2
                size={18}
                className="verified-icon"
              />

            </div>

          </div>

          <div className="profile-title-block">

            <h1 className="profile-name">
              {
                userProfile.fullName
              }
            </h1>

            <p className="profile-email">
              {
                userProfile.email
              }
            </p>

            <div className="profile-role-pill">

              <Shield size={14} />

              <span>
                {
                  userProfile.role
                }
              </span>

            </div>

          </div>

          <div className="profile-banner-actions">

            <Button
              variant="secondary"
              size="md"
              icon={Edit3}
              onClick={
                handleOpenEditProfile
              }
            >
              Edit Profile
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={Upload}
              onClick={() =>
                navigate(
                  '/upload'
                )
              }
            >
              Upload Material
            </Button>

          </div>

        </div>

      </div>

      {/* =================================================
          PROFILE BODY
      ================================================= */}

      <div className="container profile-body-container">

        {/* SUCCESS MESSAGE */}

        {profileSuccess && (

          <div className="profile-success-alert">

            <CheckCircle2
              size={18}
              className="success-icon"
            />

            <span>
              {profileSuccess}
            </span>

          </div>

        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="profile-stats-grid">

          <div className="payt-card stat-card">

            <span className="stat-value">
              {
                uploadedDocs.length
              }
            </span>

            <span className="stat-label">
              Uploaded Documents
            </span>

          </div>

          <div className="payt-card stat-card">

            <span className="stat-value">
              {
                userProfile
                  .stats
                  .totalDownloads
                  .toLocaleString()
              }
            </span>

            <span className="stat-label">
              Total Downloads Received
            </span>

          </div>

          <div className="payt-card stat-card">

            <span className="stat-value">
              {
                userProfile
                  .stats
                  .averageRating
              } ★
            </span>

            <span className="stat-label">
              Average Material Rating
            </span>

          </div>

        </div>

        {/* =================================================
            ACCOUNT INFORMATION
        ================================================= */}

        <div className="payt-card profile-info-card">

          <div className="info-card-header">

            <h3 className="section-title">
              Account Information
            </h3>

            <Button
              variant="ghost"
              size="sm"
              icon={Edit3}
              onClick={
                handleOpenEditProfile
              }
            >
              Edit
            </Button>

          </div>

          <div className="account-details-grid">

            <div className="detail-item">

              <span className="item-label">
                Full Name
              </span>

              <span className="item-value">
                {
                  userProfile.fullName
                }
              </span>

            </div>

            <div className="detail-item">

              <span className="item-label">
                Email Address
              </span>

              <span className="item-value">
                {
                  userProfile.email
                }
              </span>

            </div>

            <div className="detail-item">

              <span className="item-label">
                Account Role
              </span>

              <span className="item-value">
                {
                  userProfile.role
                }
              </span>

            </div>

            <div className="detail-item">

              <span className="item-label">
                Joined Date
              </span>

              <span className="item-value">
                {
                  userProfile.joinedDate
                }
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            MY UPLOADED DOCUMENTS
        ================================================= */}

        <div className="payt-card profile-uploads-card">

          <div className="info-card-header">

            <h3 className="section-title">
              My Uploaded Documents
            </h3>

            <span className="uploads-count-badge">
              {
                uploadedDocs.length
              } items
            </span>

          </div>

          {uploadedDocs.length === 0 ? (

            <div className="empty-uploads">

              <FolderOpen
                size={48}
                className="text-orange"
              />

              <p className="empty-title">
                No uploaded documents yet
              </p>

              <p className="empty-subtext">
                Share your lecture notes or
                study guides with fellow students.
              </p>

              <Button
                variant="primary"
                size="sm"
                icon={Upload}
                onClick={() =>
                  navigate(
                    '/upload'
                  )
                }
              >
                Upload Your First Document
              </Button>

            </div>

          ) : (

            <div className="uploaded-list">

              {uploadedDocs.map(
                (doc) => (

                  <div
                    key={doc.id}
                    className="uploaded-item"
                  >

                    <div className="uploaded-item-main">

                      <div className="uploaded-file-icon">

                        <FileText
                          size={22}
                          className="text-orange"
                        />

                      </div>

                      <div className="uploaded-file-text">

                        <Link
                          to={`/documents/${doc.id}`}
                          className="uploaded-title"
                        >
                          {doc.title}
                        </Link>

                        <div className="uploaded-submeta">

                          {/* =================================
                              CATEGORY
                          ================================= */}

                          <span className="badge badge-major">
                            {
                              getCategoryName(
                                doc.categoryId,
                                doc.major
                              )
                            }
                          </span>

                          <span>
                            • {doc.fileSize}
                          </span>

                          <span>
                            • Uploaded{' '}
                            {
                              formatDate(
                                doc.uploadDate
                              )
                            }
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="uploaded-item-actions">

                      <div className="uploaded-dl-count">

                        <Download
                          size={14}
                        />

                        {' '}
                        {doc.downloads}

                      </div>

                      {/* VIEW */}

                      <Link
                        to={`/documents/${doc.id}`}
                      >

                        <button
                          type="button"
                          className="action-icon-btn"
                          title="View Document"
                        >
                          <Eye size={16} />
                        </button>

                      </Link>

                      {/* EDIT */}

                      <button
                        type="button"
                        className="action-icon-btn"
                        title="Edit Document"
                        onClick={() =>
                          handleOpenEditDoc(
                            doc
                          )
                        }
                      >
                        <Edit3 size={16} />
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        className="action-icon-btn danger"
                        title="Delete Document"
                        onClick={() =>
                          handleOpenDeleteDoc(
                            doc
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* =================================================
            SAVED DOCUMENTS
        =================================================
        
        Đây là tài liệu user đã bấm:

        Save to Library

        ở Document Detail.

        GET /users/saved-document

        ================================================= */}

        <div className="payt-card profile-uploads-card">

          <div className="info-card-header">

            <h3 className="section-title">
              Saved Documents
            </h3>

            <span className="uploads-count-badge">
              {
                savedDocs.length
              } items
            </span>

          </div>

          {/* =============================================
              LOADING STATE
          ============================================= */}

          {isLoadingSavedDocs ? (

            <div className="empty-uploads">

              <p className="empty-title">
                Loading saved documents...
              </p>

            </div>

          ) : savedDocsError ? (

            // =============================================
            // ERROR STATE
            // =============================================

            <div className="empty-uploads">

              <AlertTriangle
                size={42}
                className="warning-icon"
              />

              <p className="empty-title">
                Unable to load saved documents
              </p>

              <p className="empty-subtext">
                {savedDocsError}
              </p>

            </div>

          ) : savedDocs.length === 0 ? (

            // =============================================
            // EMPTY STATE
            // =============================================

            <div className="empty-uploads">

              <Bookmark
                size={48}
                className="text-orange"
              />

              <p className="empty-title">
                No saved documents yet
              </p>

              <p className="empty-subtext">
                Documents you save will appear here.
              </p>

              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  navigate(
                    '/documents'
                  )
                }
              >
                Browse Documents
              </Button>

            </div>

          ) : (

            // =============================================
            // SAVED DOCUMENT LIST
            // =============================================

            <div className="uploaded-list">

              {savedDocs.map(
                (doc) => (

                  <div
                    key={doc.id}
                    className="uploaded-item"
                  >

                    {/* DOCUMENT INFO */}

                    <div className="uploaded-item-main">

                      <div className="uploaded-file-icon">

                        <Bookmark
                          size={22}
                          className="text-orange"
                        />

                      </div>

                      <div className="uploaded-file-text">

                        <Link
                          to={`/documents/${doc.id}`}
                          className="uploaded-title"
                        >
                          {doc.title}
                        </Link>

                        <div className="uploaded-submeta">

                          {/* =================================
                              CATEGORY
                              
                              Saved Documents không có
                              category_title.
                              
                              Ta dùng category_id để tìm tên
                              trong GET /category.
                          ================================= */}

                          <span className="badge badge-major">
                            {
                              getCategoryName(
                                doc.categoryId,
                                doc.major
                              )
                            }
                          </span>

                          <span>
                            • {doc.fileSize}
                          </span>

                          {doc.uploaderName && (

                            <span>
                              • By{' '}
                              {
                                doc.uploaderName
                              }
                            </span>

                          )}

                        </div>

                      </div>

                    </div>

                    {/* SAVED DOCUMENT ACTION */}

                    <div className="uploaded-item-actions">

                      <div className="uploaded-dl-count">

                        <Download
                          size={14}
                        />

                        {' '}
                        {doc.downloads}

                      </div>

                      {/* ===================================
                          CHỈ VIEW
                          
                          Saved document có thể là tài liệu
                          của user khác.
                          
                          Vì vậy không cho Edit/Delete ở đây.
                      =================================== */}

                      <Link
                        to={`/documents/${doc.id}`}
                      >

                        <button
                          type="button"
                          className="action-icon-btn"
                          title="View Document"
                        >
                          <Eye size={16} />
                        </button>

                      </Link>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <div className="profile-account-footer-actions">

          <Button
            variant="danger"
            size="md"
            icon={LogOut}
            onClick={
              handleLogout
            }
            loading={
              isLoggingOut
            }
          >

            {isLoggingOut
              ? 'Logging out...'
              : 'Logout Account'}

          </Button>

        </div>

      </div>

      {/* =================================================
          DELETE DOCUMENT MODAL
      ================================================= */}

      <Modal
        isOpen={
          !!deleteModalDoc
        }
        onClose={
          handleCloseDeleteModal
        }
        title="Confirm Document Deletion"
        footer={
          <>

            <Button
              variant="secondary"
              size="md"
              onClick={
                handleCloseDeleteModal
              }
              disabled={
                isDeletingDoc
              }
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              size="md"
              onClick={
                handleConfirmDelete
              }
              loading={
                isDeletingDoc
              }
              disabled={
                isDeletingDoc
              }
            >

              {isDeletingDoc
                ? 'Deleting...'
                : 'Delete Document'}

            </Button>

          </>
        }
      >

        {deleteModalDoc && (

          <div className="delete-modal-content">

            <AlertTriangle
              size={36}
              className="warning-icon"
            />

            <p>
              Are you sure you want to delete{' '}

              <strong>
                "
                {
                  deleteModalDoc.title
                }
                "
              </strong>

              ?
            </p>

            <p className="subtext">
              This operation is permanent
              and cannot be undone.
            </p>

            {deleteError && (

              <p className="payt-input-error">
                {deleteError}
              </p>

            )}

          </div>

        )}

      </Modal>

      {/* =================================================
          EDIT PROFILE MODAL
      ================================================= */}

      <Modal
        isOpen={
          editProfileOpen
        }
        onClose={() =>
          setEditProfileOpen(
            false
          )
        }
        title="Edit Profile Information"
        footer={
          <>

            <Button
              variant="secondary"
              size="md"
              onClick={() =>
                setEditProfileOpen(
                  false
                )
              }
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={
                handleSaveProfile
              }
              loading={
                isSavingProfile
              }
            >

              {isSavingProfile
                ? 'Saving...'
                : 'Save Changes'}

            </Button>

          </>
        }
      >

        <form
          onSubmit={
            handleSaveProfile
          }
          className="edit-profile-modal-form"
        >

          <p className="modal-description">
            Update your personal account
            information.
          </p>

          {/* AVATAR */}

          <div className="avatar-edit-preview-wrapper">

            <img
              src={
                profileDraft.avatar ||
                userProfile.avatar
              }
              alt="Avatar Preview"
              className="avatar-edit-preview"
            />

            <Input
              label="Avatar Image URL"
              placeholder="https://..."
              value={
                profileDraft.avatar
              }
              onChange={(e) =>
                setProfileDraft(
                  (prev) => ({
                    ...prev,

                    avatar:
                      e.target.value,
                  })
                )
              }
              className="full-width-field"
            />

          </div>

          <div className="form-fields">

            {/* FULL NAME */}

            <Input
              label="Full Name"
              value={
                profileDraft.fullName
              }
              onChange={(e) => {

                setProfileDraft(
                  (prev) => ({
                    ...prev,

                    fullName:
                      e.target.value,
                  })
                );

                if (profileError) {
                  setProfileError('');
                }

              }}
              error={
                profileError
              }
              required
            />

            {/* EMAIL */}

            <Input
              label="Email Address"
              type="email"
              value={
                profileDraft.email
              }
              onChange={(e) =>
                setProfileDraft(
                  (prev) => ({
                    ...prev,

                    email:
                      e.target.value,
                  })
                )
              }
            />

          </div>

        </form>

      </Modal>

      {/* =================================================
          EDIT DOCUMENT MODAL
      ================================================= */}

      <Modal
        isOpen={
          !!editDocModal
        }
        onClose={() => {

          if (!isSavingDoc) {
            setEditDocModal(
              null
            );

            setDocError('');
          }

        }}
        title="Edit Document Information"
        footer={
          <>

            <Button
              variant="secondary"
              size="md"
              onClick={() => {

                if (!isSavingDoc) {
                  setEditDocModal(
                    null
                  );

                  setDocError('');
                }

              }}
              disabled={
                isSavingDoc
              }
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={
                handleSaveDoc
              }
              loading={
                isSavingDoc
              }
              disabled={
                isSavingDoc
              }
            >

              {isSavingDoc
                ? 'Saving...'
                : 'Save Changes'}

            </Button>

          </>
        }
      >

        {editDocModal && (

          <form
            onSubmit={
              handleSaveDoc
            }
            className="edit-profile-modal-form"
          >

            <p className="modal-description">
              Update document title,
              description and category.
            </p>

            <div className="form-fields">

              {/* TITLE */}

              <Input
                label="Document Title"
                value={
                  docDraft.title
                }
                onChange={(e) => {

                  setDocDraft(
                    (prev) => ({
                      ...prev,

                      title:
                        e.target.value,
                    })
                  );

                  if (docError) {
                    setDocError('');
                  }

                }}
                required
              />

              {/* DESCRIPTION */}

              <div className="payt-input-group">

                <label className="payt-input-label">
                  Description
                </label>

                <textarea
                  className="payt-textarea"
                  rows={4}
                  value={
                    docDraft.description
                  }
                  onChange={(e) =>
                    setDocDraft(
                      (prev) => ({
                        ...prev,

                        description:
                          e.target.value,
                      })
                    )
                  }
                  placeholder="Document description"
                />

              </div>

              {/* CATEGORY */}

              <div className="payt-input-group">

                <label className="payt-input-label">
                  Document Category
                </label>

                <select
                  className="payt-input"
                  value={
                    docDraft.categoryId
                  }
                  disabled={
                    isLoadingCategories ||
                    isSavingDoc
                  }
                  onChange={(e) => {

                    setDocDraft(
                      (prev) => ({
                        ...prev,

                        categoryId:
                          e.target.value,
                      })
                    );

                    if (docError) {
                      setDocError('');
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

              </div>

              {/* EDIT ERROR */}

              {docError && (

                <p className="payt-input-error">
                  {docError}
                </p>

              )}

            </div>

          </form>

        )}

      </Modal>

    </div>
  );
};

export default Profile;