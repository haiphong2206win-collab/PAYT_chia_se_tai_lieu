import { useState, useEffect } from 'react';
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
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';

import {
  getUserProfileApi,
  updateUserProfileApi,
  getMyDocumentsApi,
} from '../../services/user.api';

import { logoutApi } from '../../services/auth.api';

import { MOCK_USER } from '../../mock/user';
import { MAJORS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

import './Profile.css';

export const Profile = () => {
  const navigate = useNavigate();

  // =====================================================
  // 1. USER PROFILE STATE
  // =====================================================

  // MOCK_USER hiện chỉ làm fallback.
  // Dữ liệu thật từ Backend sẽ ghi đè các field tương ứng.
  const [userProfile, setUserProfile] = useState({
    fullName: MOCK_USER.fullName,
    email: MOCK_USER.email,
    role: MOCK_USER.role,
    joinedDate: MOCK_USER.joinedDate,
    avatar: MOCK_USER.avatar,
    stats: { ...MOCK_USER.stats },
  });

  // =====================================================
  // 2. LOAD PROFILE FROM BACKEND
  // =====================================================

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfileApi();

        console.log('Profile API response:', response);

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
  // 3. UPLOADED DOCUMENTS
  // =====================================================

  const [uploadedDocs, setUploadedDocs] = useState([]);

  useEffect(() => {
    const fetchMyDocuments = async () => {
      try {
        const response = await getMyDocumentsApi();

        console.log(
          'My Documents API response:',
          response
        );

        const documents =
          response.documents ||
          response.data ||
          [];

        setUploadedDocs(documents);
      } catch (error) {
        console.error(
          'My Documents API error:',
          error
        );

        setUploadedDocs([]);
      }
    };

    fetchMyDocuments();
  }, []);


  // =====================================================
  // 4. EDIT PROFILE STATE
  // =====================================================

  const [editProfileOpen, setEditProfileOpen] =
    useState(false);

  const [profileDraft, setProfileDraft] =
    useState({
      fullName: '',
      email: '',
      avatar: '',
    });

  const [profileError, setProfileError] =
    useState('');

  const [profileSuccess, setProfileSuccess] =
    useState('');

  const [isSavingProfile, setIsSavingProfile] =
    useState(false);

  // =====================================================
  // 5. EDIT DOCUMENT STATE
  // =====================================================

  const [editDocModal, setEditDocModal] =
    useState(null);

  const [docDraft, setDocDraft] =
    useState({
      title: '',
      subject: '',
      major: '',
    });

  const [docError, setDocError] =
    useState('');

  // =====================================================
  // 6. DELETE DOCUMENT STATE
  // =====================================================

  const [
    deleteModalDoc,
    setDeleteModalDoc,
  ] = useState(null);

  // =====================================================
  // 7. LOGOUT STATE
  // =====================================================

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  // =====================================================
  // 8. OPEN EDIT PROFILE
  // =====================================================

  const handleOpenEditProfile = () => {
    setProfileDraft({
      fullName: userProfile.fullName,
      email: userProfile.email,
      avatar: userProfile.avatar,
    });

    setProfileError('');
    setEditProfileOpen(true);
  };

  // =====================================================
  // 9. SAVE PROFILE - BACKEND THẬT
  // =====================================================

  const handleSaveProfile = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!profileDraft.fullName.trim()) {
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
      // Dữ liệu FE gửi sang Backend
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
        await updateUserProfileApi(userData);

      console.log(
        'Update Profile API response:',
        response
      );

      /*
        Sau khi PATCH thành công,
        GET profile lại một lần nữa.

        Mục đích:
        Không tự giả định dữ liệu trong DB.
        Backend trả gì thì FE hiển thị đúng dữ liệu đó.
      */
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

      setEditProfileOpen(false);

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
  // 10. OPEN EDIT DOCUMENT
  // =====================================================

  const handleOpenEditDoc = (doc) => {
    setEditDocModal(doc);

    setDocDraft({
      title: doc.title,
      subject: doc.subject || '',
      major: doc.major || '',
    });

    setDocError('');
  };

  // =====================================================
  // 11. SAVE DOCUMENT
  // =====================================================

  // Hiện vẫn LOCAL.
  // PATCH /documents/:id sẽ nối sau.
  const handleSaveDoc = (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!docDraft.title.trim()) {
      setDocError(
        'Document title is required.'
      );

      return;
    }

    setUploadedDocs((prev) =>
      prev.map((doc) =>
        doc.id === editDocModal.id
          ? {
            ...doc,

            title:
              docDraft.title.trim(),

            subject:
              docDraft.subject.trim() ||
              doc.subject,

            major:
              docDraft.major ||
              doc.major,
          }
          : doc
      )
    );

    setDocError('');
    setEditDocModal(null);
  };

  // =====================================================
  // 12. DELETE DOCUMENT
  // =====================================================

  // Hiện vẫn LOCAL.
  // DELETE /documents/:id sẽ nối sau.
  const handleConfirmDelete = () => {
    if (!deleteModalDoc) {
      return;
    }

    setUploadedDocs((prev) =>
      prev.filter(
        (doc) =>
          doc.id !== deleteModalDoc.id
      )
    );

    setDeleteModalDoc(null);
  };

  // =====================================================
  // 13. LOGOUT
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
  // 14. UI
  // =====================================================

  return (
    <div className="payt-profile-page">

      {/* PROFILE BANNER */}

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
              onClick={handleOpenEditProfile}
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

      {/* PROFILE BODY */}

      <div className="container profile-body-container">

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

        {/* STATS */}

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

        {/* ACCOUNT INFORMATION */}

        <div className="payt-card profile-info-card">

          <div className="info-card-header">

            <h3 className="section-title">
              Account Information
            </h3>

            <Button
              variant="ghost"
              size="sm"
              icon={Edit3}
              onClick={handleOpenEditProfile}
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

        {/* MY UPLOADED DOCUMENTS */}

        <div className="payt-card profile-uploads-card">

          <div className="info-card-header">

            <h3 className="section-title">
              My Uploaded Documents
            </h3>

            <span className="uploads-count-badge">
              {uploadedDocs.length} items
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
                  navigate('/upload')
                }
              >
                Upload Your First Document
              </Button>

            </div>

          ) : (

            <div className="uploaded-list">

              {uploadedDocs.map((doc) => (

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
                          {doc.major}
                        </span>

                        <span>
                          {doc.subject}
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

                  <div className="uploaded-item-actions">

                    <div className="uploaded-dl-count">

                      <Download size={14} />

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
                      >
                        <Eye size={16} />
                      </button>

                    </Link>

                    <button
                      type="button"
                      className="action-icon-btn"
                      title="Edit Document"
                      onClick={() =>
                        handleOpenEditDoc(doc)
                      }
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      className="action-icon-btn danger"
                      title="Delete Document"
                      onClick={() =>
                        setDeleteModalDoc(doc)
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

        {/* LOGOUT */}

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

      {/* DELETE DOCUMENT MODAL */}

      <Modal
        isOpen={!!deleteModalDoc}
        onClose={() =>
          setDeleteModalDoc(null)
        }
        title="Confirm Document Deletion"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() =>
                setDeleteModalDoc(null)
              }
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmDelete}
            >
              Delete Document
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

          </div>

        )}

      </Modal>

      {/* EDIT PROFILE MODAL */}

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
              onClick={handleSaveProfile}
              loading={isSavingProfile}
            >
              {isSavingProfile
                ? 'Saving...'
                : 'Save Changes'}
            </Button>
          </>
        }
      >

        <form
          onSubmit={handleSaveProfile}
          className="edit-profile-modal-form"
        >

          <p className="modal-description">
            Update your personal account
            information.
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
              value={profileDraft.avatar}
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

                if (profileError) {
                  setProfileError('');
                }
              }}
              error={profileError}
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

      {/* EDIT DOCUMENT MODAL */}

      <Modal
        isOpen={!!editDocModal}
        onClose={() =>
          setEditDocModal(null)
        }
        title="Edit Document Information"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() =>
                setEditDocModal(null)
              }
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleSaveDoc}
            >
              Save Changes
            </Button>
          </>
        }
      >

        {editDocModal && (

          <form
            onSubmit={handleSaveDoc}
            className="edit-profile-modal-form"
          >

            <p className="modal-description">
              Update document title and
              academic metadata.
            </p>

            <div className="form-fields">

              <Input
                label="Document Title"
                value={docDraft.title}
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
                error={docError}
                required
              />

              <Input
                label="Course / Subject"
                value={docDraft.subject}
                onChange={(e) =>
                  setDocDraft(
                    (prev) => ({
                      ...prev,
                      subject:
                        e.target.value,
                    })
                  )
                }
              />

              <Select
                label="Academic Major"
                options={MAJORS}
                value={docDraft.major}
                onChange={(e) =>
                  setDocDraft(
                    (prev) => ({
                      ...prev,
                      major:
                        e.target.value,
                    })
                  )
                }
              />

            </div>

          </form>

        )}

      </Modal>

    </div>
  );
};

export default Profile;