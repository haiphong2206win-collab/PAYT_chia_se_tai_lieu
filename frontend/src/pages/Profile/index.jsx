import {
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

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
  clearUserProfileCache,
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
  formatDate,
} from '../../utils/formatters';

import './Profile.css';

// =====================================================
// FORMAT FILE SIZE
// =====================================================

const formatFileSize = (bytes) => {
  const size =
    Number(bytes || 0);

  if (!size) {
    return '0 KB';
  }

  if (
    size >=
    1024 * 1024
  ) {
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
// MAP BACKEND DOCUMENT → UI
// =====================================================

const mapBackendDocument = (doc) => ({
  id:
    doc.id ||
    doc.document_id,

  title:
    doc.title ||
    'Untitled Document',

  // UI cũ gọi là major,
  // Backend thật là Category.
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

  subject: '',

  fileSize:
    formatFileSize(
      doc.file_size
    ),

  uploadDate:
    doc.created_at,

  downloads:
    Number(
      doc.download_count
    ) || 0,

  categoryId:
    doc.category_id ||
    doc.document?.category_id,

  description:
    doc.description || '',

  fileType:
    doc.file_type,

  fileUrl:
    doc.file_url,

  status:
    doc.status,

  views:
    Number(
      doc.view_count
    ) || 0,

  reviewCount:
    Number(
      doc.review_count
    ) || 0,

  averageRating:
    Number(
      doc.average_rating
    ) || 0,

  uploaderName:
    doc.uploader_name ||
    doc.full_name ||
    '',
});

// =====================================================
// PROFILE
// =====================================================

export const Profile = () => {
  const navigate =
    useNavigate();

  // ===================================================
  // USER PROFILE
  // ===================================================

  const [
    userProfile,
    setUserProfile,
  ] = useState(null);

  const [
    isLoadingProfile,
    setIsLoadingProfile,
  ] = useState(true);

  const [
    profileFetchError,
    setProfileFetchError,
  ] = useState('');

  // ===================================================
  // GET PROFILE
  // ===================================================

  useEffect(() => {
    const fetchUserProfile =
      async () => {
        setIsLoadingProfile(true);
        setProfileFetchError('');

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

          const fullName =
            profile.fullName ||
            profile.full_name ||
            '';

          setUserProfile({
            id:
              profile.id ||
              profile.user_id ||
              null,

            fullName,

            email:
              profile.email ||
              '',

            avatar:
              profile.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                fullName ||
                'User'
              )}`,

            role:
              profile.role ||
              '',

            joinedDate:
              profile.joinedDate ||
              profile.joined_date ||
              profile.created_at ||
              '',
          });
        } catch (error) {
          console.error(
            'Profile API error:',
            error
          );

          setUserProfile(null);

          setProfileFetchError(
            error.response
              ?.data
              ?.message ||
            'Unable to load profile.'
          );
        } finally {
          setIsLoadingProfile(
            false
          );
        }
      };

    fetchUserProfile();
  }, []);

  // ===================================================
  // MY UPLOADED DOCUMENTS
  // ===================================================

  const [
    uploadedDocs,
    setUploadedDocs,
  ] = useState([]);

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

          setUploadedDocs(
            documents.map(
              mapBackendDocument
            )
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

  // ===================================================
  // SAVED DOCUMENTS
  // ===================================================

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

  const loadSavedDocuments =
    useCallback(
      async () => {
        setIsLoadingSavedDocs(
          true
        );

        setSavedDocsError('');

        try {
          const response =
            await getSavedDocumentsApi();

          console.log(
            'Saved Documents API response:',
            response
          );

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

          setSavedDocs(
            documents.map(
              mapBackendDocument
            )
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

  useEffect(() => {
    loadSavedDocuments();
  }, [loadSavedDocuments]);

  // ===================================================
  // CATEGORIES
  // ===================================================

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    isLoadingCategories,
    setIsLoadingCategories,
  ] = useState(false);

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

          setCategories(
            Array.isArray(data)
              ? data
              : []
          );
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

  // ===================================================
  // CATEGORY ID → CATEGORY NAME
  // ===================================================

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

  // ===================================================
  // EDIT PROFILE STATE
  // ===================================================

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

  // ===================================================
  // EDIT DOCUMENT STATE
  // ===================================================

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

  // ===================================================
  // DELETE DOCUMENT STATE
  // ===================================================

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

  // ===================================================
  // LOGOUT
  // ===================================================

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  // ===================================================
  // OPEN EDIT PROFILE
  // ===================================================

  const handleOpenEditProfile =
    () => {
      if (!userProfile) {
        return;
      }

      setProfileDraft({
        fullName:
          userProfile.fullName ||
          '',

        email:
          userProfile.email ||
          '',

        avatar:
          userProfile.avatar ||
          '',
      });

      setProfileError('');

      setEditProfileOpen(
        true
      );
    };

  // ===================================================
  // PATCH PROFILE
  // ===================================================

  const handleSaveProfile =
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      const fullName =
        String(
          profileDraft.fullName ||
          ''
        ).trim();

      const email =
        String(
          profileDraft.email ||
          ''
        ).trim();

      const avatar =
        String(
          profileDraft.avatar ||
          ''
        ).trim();

      if (!fullName) {
        setProfileError(
          'Full Name is required.'
        );

        return;
      }

      if (isSavingProfile) {
        return;
      }

      setIsSavingProfile(
        true
      );

      setProfileError('');

      try {
        const userData = {
          fullName,
          email,
          avatar,
        };

        const response =
          await updateUserProfileApi(
            userData
          );

        console.log(
          'Update Profile API response:',
          response
        );

        // updateUserProfileApi đã clear cache.
        // GET lại profile thật.
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
              fullName,

            email:
              updatedProfile.email ||
              email ||
              prev.email,

            avatar:
              updatedProfile.avatar ||
              avatar ||
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

  // ===================================================
  // OPEN EDIT DOCUMENT
  // ===================================================

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

  // ===================================================
  // PATCH DOCUMENT
  // ===================================================

  const handleSaveDoc =
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      if (!editDocModal) {
        return;
      }

      const title =
        String(
          docDraft.title ||
          ''
        ).trim();

      const description =
        String(
          docDraft.description ||
          ''
        ).trim();

      if (!title) {
        setDocError(
          'Document title is required.'
        );

        return;
      }

      if (!docDraft.categoryId) {
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
          title,
          description,

          categoryId:
            docDraft.categoryId,
        };

        console.log(
          'Update Document payload:',
          documentData
        );

        const response =
          await updateDocumentApi(
            editDocModal.id,
            documentData
          );

        console.log(
          'Update Document API response:',
          response
        );

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

  // ===================================================
  // DELETE DOCUMENT
  // ===================================================

  const handleOpenDeleteDoc =
    (doc) => {
      setDeleteError('');
      setDeleteModalDoc(doc);
    };

  const handleConfirmDelete =
    async () => {
      if (
        !deleteModalDoc ||
        isDeletingDoc
      ) {
        return;
      }

      setIsDeletingDoc(true);
      setDeleteError('');

      try {
        const response =
          await deleteDocumentApi(
            deleteModalDoc.id
          );

        console.log(
          'Delete Document API response:',
          response
        );

        await Promise.all([
          loadMyDocuments(),
          loadSavedDocuments(),
        ]);

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

  const handleCloseDeleteModal =
    () => {
      if (isDeletingDoc) {
        return;
      }

      setDeleteModalDoc(null);
      setDeleteError('');
    };

  // ===================================================
  // LOGOUT
  // ===================================================

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

        // Session đã hết.
        // Không được giữ profile cache cũ.
        clearUserProfileCache();

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

  // ===================================================
  // PROFILE STATS THẬT
  // ===================================================

  const totalDownloadsReceived =
    uploadedDocs.reduce(
      (total, doc) =>
        total +
        Number(
          doc.downloads || 0
        ),
      0
    );

  const totalReviewCount =
    uploadedDocs.reduce(
      (total, doc) =>
        total +
        Number(
          doc.reviewCount || 0
        ),
      0
    );

  const totalWeightedRating =
    uploadedDocs.reduce(
      (total, doc) =>
        total +
        (
          Number(
            doc.averageRating || 0
          ) *
          Number(
            doc.reviewCount || 0
          )
        ),
      0
    );

  const averageMaterialRating =
    totalReviewCount > 0
      ? (
        totalWeightedRating /
        totalReviewCount
      ).toFixed(1)
      : '0.0';

  // ===================================================
  // PROFILE LOADING STATE
  // ===================================================
  //
  // Không dùng MOCK_USER để lấp dữ liệu trong lúc chờ.
  // Chỉ render Profile khi GET /users/profile đã hoàn tất.
  //
  // ===================================================

  if (isLoadingProfile) {
    return (
      <div className="payt-profile-page">

        <div className="container profile-body-container">

          <div className="payt-card">

            Loading profile...

          </div>

        </div>

      </div>
    );
  }

  // ===================================================
  // PROFILE ERROR STATE
  // ===================================================

  if (
    profileFetchError ||
    !userProfile
  ) {
    return (
      <div className="payt-profile-page">

        <div className="container profile-body-container">

          <div className="payt-card">

            <AlertTriangle
              size={36}
              className="warning-icon"
            />

            <h2>
              Unable to load profile
            </h2>

            <p>
              {
                profileFetchError ||
                'Profile data is unavailable.'
              }
            </p>

            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                navigate('/login')
              }
            >
              Back to Login
            </Button>

          </div>

        </div>

      </div>
    );
  }

  // ===================================================
  // UI
  // ===================================================

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
                navigate('/upload')
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

        {/* SUCCESS */}

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
                totalDownloadsReceived
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
                averageMaterialRating
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
                    ? formatDate(
                      userProfile.joinedDate
                    )
                    : 'Not available'
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
                Share your lecture notes or study guides
                with fellow students.
              </p>

              <Button
                variant="primary"
                size="sm"
                icon={Upload}
                onClick={() =>
                  navigate('/upload')
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
                          aria-label="View Document"
                        >
                          <Eye size={16} />
                        </button>

                      </Link>

                      {/* EDIT */}

                      <button
                        type="button"
                        className="action-icon-btn"
                        title="Edit Document"
                        aria-label="Edit Document"
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
                        aria-label="Delete Document"
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

          {isLoadingSavedDocs ? (

            <div className="empty-uploads">

              <p className="empty-title">
                Loading saved documents...
              </p>

            </div>

          ) : savedDocsError ? (

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
                  navigate('/documents')
                }
              >
                Browse Documents
              </Button>

            </div>

          ) : (

            <div className="uploaded-list">

              {savedDocs.map(
                (doc) => (

                  <div
                    key={doc.id}
                    className="uploaded-item"
                  >

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

                    <div className="uploaded-item-actions">

                      <div className="uploaded-dl-count">

                        <Download
                          size={14}
                        />

                        {' '}
                        {doc.downloads}

                      </div>

                      <Link
                        to={`/documents/${doc.id}`}
                      >

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

            {
              isLoggingOut
                ? 'Logging out...'
                : 'Logout Account'
            }

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

              {
                isDeletingDoc
                  ? 'Deleting...'
                  : 'Delete Document'
              }

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
                "{deleteModalDoc.title}"
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
        onClose={() => {
          if (!isSavingProfile) {
            setEditProfileOpen(
              false
            );

            setProfileError('');
          }
        }}
        title="Edit Profile Information"
        footer={
          <>

            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                if (!isSavingProfile) {
                  setEditProfileOpen(
                    false
                  );

                  setProfileError('');
                }
              }}
              disabled={
                isSavingProfile
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
              disabled={
                isSavingProfile
              }
            >

              {
                isSavingProfile
                  ? 'Saving...'
                  : 'Save Changes'
              }

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
            Update your personal account information.
          </p>

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

                setProfileError('');

              }}
              error={
                profileError
              }
              required
            />

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
            setEditDocModal(null);
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
                  setEditDocModal(null);
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

              {
                isSavingDoc
                  ? 'Saving...'
                  : 'Save Changes'
              }

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

                  setDocError('');

                }}
                required
              />

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

                    setDocError('');

                  }}
                >

                  <option value="">

                    {
                      isLoadingCategories
                        ? 'Loading categories...'
                        : 'Select category'
                    }

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

                        {
                          category.title ||
                          category.name ||
                          category.slug ||
                          'Category'
                        }

                      </option>

                    )
                  )}

                </select>

              </div>

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