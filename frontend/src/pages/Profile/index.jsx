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
} from 'lucide-react';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

// =====================================================
// API LIÊN QUAN ĐẾN USER
// =====================================================
import {
  getUserProfileApi,
  updateUserProfileApi,
  getMyDocumentsApi,
} from '../../services/user.api';

// =====================================================
// API LIÊN QUAN ĐẾN DOCUMENT
// =====================================================
// updateDocumentApi:
// PATCH /documents/:documentId
//
// deleteDocumentApi:
// DELETE /documents/:documentId
// =====================================================
import {
  updateDocumentApi,
  deleteDocumentApi,
} from '../../services/document.api';

// =====================================================
// API CATEGORY
// GET /category
// Dùng để hiển thị category trong modal Edit Document
// =====================================================
import {
  getCategories,
} from '../../services/category.api';

// =====================================================
// AUTH API
// =====================================================
import { logoutApi } from '../../services/auth.api';

import { MOCK_USER } from '../../mock/user';
import { formatDate } from '../../utils/formatters';

import './Profile.css';

export const Profile = () => {
  const navigate = useNavigate();

  // =====================================================
  // 1. USER PROFILE STATE
  // =====================================================
  //
  // MOCK_USER hiện chỉ đóng vai trò fallback.
  // Khi GET /users/profile thành công,
  // dữ liệu Backend sẽ ghi đè lên các field tương ứng.
  // =====================================================

  const [userProfile, setUserProfile] = useState({
    fullName: MOCK_USER.fullName,
    email: MOCK_USER.email,
    role: MOCK_USER.role,
    joinedDate: MOCK_USER.joinedDate,
    avatar: MOCK_USER.avatar,
    stats: { ...MOCK_USER.stats },
  });

  // =====================================================
  // 2. LOAD PROFILE TỪ BACKEND
  // =====================================================
  //
  // Khi trang Profile mount:
  //
  // FE
  // ↓
  // GET /users/profile
  // ↓
  // Backend
  // ↓
  // trả thông tin user
  // ↓
  // setUserProfile()
  // ↓
  // React render dữ liệu thật
  //
  // =====================================================

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response =
          await getUserProfileApi();

        console.log(
          'Profile API response:',
          response
        );

        // Backend hiện có response dạng:
        // {
        //   message: "...",
        //   data: {...}
        // }
        //
        // Nhưng giữ thêm fallback để code an toàn hơn.
        const profile =
          response.user ||
          response.data ||
          response;

        setUserProfile((prev) => ({
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
        }));
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

  const [uploadedDocs, setUploadedDocs] =
    useState([]);

  // =====================================================
  // 4. HÀM LOAD MY DOCUMENTS
  // =====================================================
  //
  // Tách thành function riêng vì hàm này được dùng:
  //
  // - khi Profile vừa mở
  // - sau khi Edit Document
  // - sau khi Delete Document
  //
  // Mục đích:
  // Sau mỗi thao tác thay đổi DB,
  // FE GET lại dữ liệu thật từ Backend.
  // Không tự giả định dữ liệu ở local.
  //
  // =====================================================

  const loadMyDocuments = useCallback(
    async () => {
      try {
        // GET /users/my-documents
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

        // =================================================
        // MAP DỮ LIỆU BACKEND → FORMAT UI
        // =================================================
        //
        // Backend:
        // category_title
        // category_id
        // file_size
        // download_count
        // created_at
        //
        // UI cũ:
        // major
        // categoryId
        // fileSize
        // downloads
        // uploadDate
        //
        // Đây là "adapter" giữa BE và FE.
        // =================================================

        const mappedDocuments =
          documents.map((doc) => ({
            id: doc.id,

            title:
              doc.title,

            // UI cũ đang dùng tên "major".
            // Nhưng dữ liệu thật hiện tại là Category.
            major:
              doc.category_title ||
              'Uncategorized',

            // Backend hiện không có field subject.
            subject: '',

            fileSize:
              doc.file_size >=
                1024 * 1024
                ? `${(
                  doc.file_size /
                  (1024 * 1024)
                ).toFixed(2)} MB`
                : `${(
                  doc.file_size /
                  1024
                ).toFixed(2)} KB`,

            uploadDate:
              doc.created_at,

            downloads:
              doc.download_count ?? 0,

            categoryId:
              doc.category_id,

            description:
              doc.description || '',

            fileType:
              doc.file_type,

            fileUrl:
              doc.file_url,

            status:
              doc.status,

            views:
              doc.view_count ?? 0,

            reviewCount:
              doc.review_count ?? 0,

            averageRating:
              doc.average_rating ?? 0,
          }));

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

  // =====================================================
  // 5. LOAD DOCUMENT KHI PROFILE MỞ
  // =====================================================

  useEffect(() => {
    loadMyDocuments();
  }, [loadMyDocuments]);

  // =====================================================
  // 6. CATEGORY STATE
  // =====================================================
  //
  // Dùng cho Edit Document.
  //
  // Thay vì dùng MAJORS mock như trước,
  // bây giờ lấy Category thật từ Backend.
  //
  // =====================================================

  const [categories, setCategories] =
    useState([]);

  const [
    isLoadingCategories,
    setIsLoadingCategories,
  ] = useState(false);

  // =====================================================
  // 7. LOAD CATEGORY
  // =====================================================
  //
  // GET /category
  //
  // =====================================================

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);

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
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // =====================================================
  // 8. EDIT PROFILE STATE
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
  // 9. EDIT DOCUMENT STATE
  // =====================================================

  // Document đang được edit
  const [
    editDocModal,
    setEditDocModal,
  ] = useState(null);

  // Dữ liệu draft trong form Edit Document
  const [
    docDraft,
    setDocDraft,
  ] = useState({
    title: '',
    description: '',
    categoryId: '',
  });

  // Error của Edit Document
  const [
    docError,
    setDocError,
  ] = useState('');

  // Trạng thái đang PATCH document
  const [
    isSavingDoc,
    setIsSavingDoc,
  ] = useState(false);

  // =====================================================
  // 10. DELETE DOCUMENT STATE
  // =====================================================

  // Document user đang muốn xóa
  const [
    deleteModalDoc,
    setDeleteModalDoc,
  ] = useState(null);

  // Trạng thái đang gọi DELETE API
  const [
    isDeletingDoc,
    setIsDeletingDoc,
  ] = useState(false);

  // Hiển thị lỗi Delete nếu Backend trả lỗi
  const [
    deleteError,
    setDeleteError,
  ] = useState('');

  // =====================================================
  // 11. LOGOUT STATE
  // =====================================================

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  // =====================================================
  // 12. OPEN EDIT PROFILE
  // =====================================================

  const handleOpenEditProfile = () => {
    // Copy dữ liệu user hiện tại
    // vào form draft.
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
  // 13. SAVE PROFILE - BACKEND THẬT
  // =====================================================
  //
  // FE
  // ↓
  // PATCH /users/profile
  // ↓
  // Backend update DB
  // ↓
  // GET /users/profile
  // ↓
  // FE render dữ liệu mới
  //
  // =====================================================

  const handleSaveProfile = async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Validate FE
    if (
      !profileDraft.fullName.trim()
    ) {
      setProfileError(
        'Full Name is required.'
      );

      return;
    }

    // Tránh user double click
    if (isSavingProfile) {
      return;
    }

    setIsSavingProfile(true);
    setProfileError('');

    try {
      // Payload gửi sang Backend
      const userData = {
        fullName:
          profileDraft.fullName.trim(),

        email:
          profileDraft.email.trim(),

        avatar:
          profileDraft.avatar.trim(),
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

      // Sau khi PATCH thành công,
      // GET profile lại từ Backend.
      const profileResponse =
        await getUserProfileApi();

      console.log(
        'Profile after update:',
        profileResponse
      );

      const updatedProfile =
        profileResponse.user ||
        profileResponse.data ||
        profileResponse;

      setUserProfile((prev) => ({
        ...prev,

        fullName:
          updatedProfile.fullName ||
          updatedProfile.full_name ||
          profileDraft.fullName.trim(),

        email:
          updatedProfile.email ||
          profileDraft.email.trim() ||
          prev.email,

        avatar:
          updatedProfile.avatar ||
          profileDraft.avatar.trim() ||
          prev.avatar,

        role:
          updatedProfile.role ||
          prev.role,

        joinedDate:
          updatedProfile.joinedDate ||
          updatedProfile.joined_date ||
          updatedProfile.created_at ||
          prev.joinedDate,
      }));

      // Đóng modal
      setEditProfileOpen(false);

      // Success message
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
        error.response?.data?.message ||
        'Unable to update profile.'
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  // =====================================================
  // 14. OPEN EDIT DOCUMENT
  // =====================================================

  const handleOpenEditDoc = (doc) => {
    // Lưu document đang được edit
    setEditDocModal(doc);

    // Đưa dữ liệu hiện tại vào form.
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
  // 15. SAVE DOCUMENT - BACKEND THẬT
  // =====================================================
  //
  // Trước đây:
  //
  // Edit
  // ↓
  // setUploadedDocs()
  // ↓
  // chỉ đổi trên React local ❌
  //
  // Bây giờ:
  //
  // Edit
  // ↓
  // PATCH /documents/:documentId
  // ↓
  // Backend update DB
  // ↓
  // GET /users/my-documents
  // ↓
  // UI cập nhật
  // ↓
  // Refresh vẫn giữ ✅
  //
  // =====================================================

  const handleSaveDoc = async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Phải có document đang edit
    if (!editDocModal) {
      return;
    }

    // Validate Title
    if (!docDraft.title.trim()) {
      setDocError(
        'Document title is required.'
      );

      return;
    }

    // Validate Category
    if (!docDraft.categoryId) {
      setDocError(
        'Document category is required.'
      );

      return;
    }

    // Chống double click
    if (isSavingDoc) {
      return;
    }

    setIsSavingDoc(true);
    setDocError('');

    try {
      // ===============================================
      // PAYLOAD GỬI SANG BACKEND
      // ===============================================

      const documentData = {
        title:
          docDraft.title.trim(),

        description:
          docDraft.description.trim(),

        categoryId:
          docDraft.categoryId,
      };

      console.log(
        'Update Document payload:',
        documentData
      );

      // ===============================================
      // PATCH /documents/:documentId
      // ===============================================

      const response =
        await updateDocumentApi(
          editDocModal.id,
          documentData
        );

      console.log(
        'Update Document API response:',
        response
      );

      // ===============================================
      // GET LẠI MY DOCUMENTS TỪ BACKEND
      // ===============================================
      //
      // Không tự sửa local state.
      // Backend trả gì thì UI hiển thị đúng dữ liệu đó.
      // ===============================================

      await loadMyDocuments();

      // Đóng Edit modal
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
        error.response?.data?.message ||
        'Unable to update document.'
      );
    } finally {
      setIsSavingDoc(false);
    }
  };

  // =====================================================
  // 16. OPEN DELETE DOCUMENT MODAL
  // =====================================================

  const handleOpenDeleteDoc = (doc) => {
    // Xóa error từ lần Delete trước.
    setDeleteError('');

    // Lưu document user muốn xóa.
    setDeleteModalDoc(doc);
  };

  // =====================================================
  // 17. DELETE DOCUMENT - BACKEND THẬT
  // =====================================================
  //
  // Trước đây:
  //
  // Delete
  // ↓
  // setUploadedDocs(filter)
  // ↓
  // chỉ xóa trên UI
  // ↓
  // refresh → document quay lại ❌
  //
  // Bây giờ:
  //
  // Delete
  // ↓
  // DELETE /documents/:documentId
  // ↓
  // Backend xóa DB
  // ↓
  // GET /users/my-documents
  // ↓
  // UI cập nhật
  // ↓
  // refresh vẫn mất ✅
  //
  // =====================================================

  const handleConfirmDelete = async () => {
    // Không có document thì không làm gì.
    if (!deleteModalDoc) {
      return;
    }

    // Tránh double click Delete.
    if (isDeletingDoc) {
      return;
    }

    setIsDeletingDoc(true);
    setDeleteError('');

    try {
      // ===============================================
      // DELETE /documents/:documentId
      // ===============================================

      const response =
        await deleteDocumentApi(
          deleteModalDoc.id
        );

      console.log(
        'Delete Document API response:',
        response
      );

      // ===============================================
      // GET LẠI DOCUMENT THẬT TỪ BACKEND
      // ===============================================

      await loadMyDocuments();

      // Đóng modal sau khi Backend xóa thành công
      setDeleteModalDoc(null);

      // Hiển thị thông báo thành công
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

      // Nếu Backend trả message,
      // ưu tiên hiển thị message Backend.
      setDeleteError(
        error.response?.data?.message ||
        'Unable to delete document.'
      );
    } finally {
      setIsDeletingDoc(false);
    }
  };

  // =====================================================
  // 18. CLOSE DELETE MODAL
  // =====================================================

  const handleCloseDeleteModal = () => {
    // Không cho đóng modal
    // trong lúc đang gửi DELETE request.
    if (isDeletingDoc) {
      return;
    }

    setDeleteModalDoc(null);
    setDeleteError('');
  };

  // =====================================================
  // 19. LOGOUT
  // =====================================================
  //
  // POST /auth/logout
  //
  // Backend clear cookie JWT.
  // Sau đó FE chuyển user về Login.
  //
  // =====================================================

  const handleLogout = async () => {
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
  // 20. UI
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
              src={userProfile.avatar}
              alt={userProfile.fullName}
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
              {userProfile.fullName}
            </h1>

            <p className="profile-email">
              {userProfile.email}
            </p>

            <div className="profile-role-pill">

              <Shield size={14} />

              <span>
                {userProfile.role}
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
              {uploadedDocs.length}
            </span>

            <span className="stat-label">
              Uploaded Documents
            </span>

          </div>

          <div className="payt-card stat-card">

            <span className="stat-value">
              {userProfile.stats.totalDownloads.toLocaleString()}
            </span>

            <span className="stat-label">
              Total Downloads Received
            </span>

          </div>

          <div className="payt-card stat-card">

            <span className="stat-value">
              {userProfile.stats.averageRating} ★
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
                {userProfile.fullName}
              </span>

            </div>

            <div className="detail-item">

              <span className="item-label">
                Email Address
              </span>

              <span className="item-value">
                {userProfile.email}
              </span>

            </div>

            <div className="detail-item">

              <span className="item-label">
                Account Role
              </span>

              <span className="item-value">
                {userProfile.role}
              </span>

            </div>

            <div className="detail-item">

              <span className="item-label">
                Joined Date
              </span>

              <span className="item-value">
                {userProfile.joinedDate}
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
              {uploadedDocs.length} items
            </span>

          </div>

          {/* EMPTY STATE */}

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
                  navigate('/upload')
                }
              >
                Upload Your First Document
              </Button>

            </div>

          ) : (

            // =============================================
            // DOCUMENT LIST
            // =============================================

            <div className="uploaded-list">

              {uploadedDocs.map((doc) => (

                <div
                  key={doc.id}
                  className="uploaded-item"
                >

                  {/* DOCUMENT INFO */}

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
                          {doc.major}
                        </span>

                        <span>
                          • {doc.fileSize}
                        </span>

                        <span>
                          • Uploaded{' '}
                          {formatDate(
                            doc.uploadDate
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* DOCUMENT ACTIONS */}

                  <div className="uploaded-item-actions">

                    {/* DOWNLOAD COUNT */}

                    <div className="uploaded-dl-count">

                      <Download size={14} />

                      {' '}
                      {doc.downloads}

                    </div>

                    {/* VIEW DOCUMENT */}

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

                    {/* EDIT DOCUMENT */}

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

                    {/* DELETE DOCUMENT */}

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

              ))}

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
            onClick={handleLogout}
            loading={isLoggingOut}
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
        isOpen={!!deleteModalDoc}
        onClose={
          handleCloseDeleteModal
        }
        title="Confirm Document Deletion"
        footer={
          <>

            {/* CANCEL */}

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

            {/* DELETE */}

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
                "{deleteModalDoc.title}"
              </strong>

              ?
            </p>

            <p className="subtext">
              This operation is permanent
              and cannot be undone.
            </p>

            {/* DELETE ERROR */}

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
        isOpen={editProfileOpen}
        onClose={() =>
          setEditProfileOpen(false)
        }
        title="Edit Profile Information"
        footer={
          <>

            <Button
              variant="secondary"
              size="md"
              onClick={() =>
                setEditProfileOpen(false)
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
          PATCH /documents/:documentId
      ================================================= */}

      <Modal
        isOpen={!!editDocModal}
        onClose={() => {

          if (!isSavingDoc) {
            setEditDocModal(null);
            setDocError('');
          }

        }}
        title="Edit Document Information"
        footer={
          <>

            {/* CANCEL */}

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

            {/* SAVE */}

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

              {/* =========================================
                  DOCUMENT TITLE
              ========================================= */}

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

              {/* =========================================
                  DESCRIPTION
              ========================================= */}

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

              {/* =========================================
                  CATEGORY
              ========================================= */}

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

                  {/* DEFAULT OPTION */}

                  <option value="">
                    {isLoadingCategories
                      ? 'Loading categories...'
                      : 'Select category'}
                  </option>

                  {/* CATEGORY TỪ BACKEND */}

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

              {/* EDIT DOCUMENT ERROR */}

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