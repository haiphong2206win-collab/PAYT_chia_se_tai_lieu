import { useState } from 'react';
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
  FolderOpen
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import { MOCK_USER } from '../../mock/user';
import { MAJORS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import './Profile.css';

export const Profile = () => {
  const navigate = useNavigate();

  // Local state for user profile
  const [userProfile, setUserProfile] = useState({
    fullName: MOCK_USER.fullName,
    email: MOCK_USER.email,
    role: MOCK_USER.role,
    joinedDate: MOCK_USER.joinedDate,
    avatar: MOCK_USER.avatar,
    stats: { ...MOCK_USER.stats }
  });

  // Local state for uploaded documents list
  const [uploadedDocs, setUploadedDocs] = useState(MOCK_USER.uploadedDocuments);

  // Edit Profile modal state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    fullName: '',
    email: '',
    avatar: ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Edit Document modal state
  const [editDocModal, setEditDocModal] = useState(null);
  const [docDraft, setDocDraft] = useState({
    title: '',
    subject: '',
    major: ''
  });
  const [docError, setDocError] = useState('');

  // Delete Confirmation modal state
  const [deleteModalDoc, setDeleteModalDoc] = useState(null);

  // Open Edit Profile modal
  const handleOpenEditProfile = () => {
    setProfileDraft({
      fullName: userProfile.fullName,
      email: userProfile.email,
      avatar: userProfile.avatar
    });
    setProfileError('');
    setEditProfileOpen(true);
  };

  // Save Edit Profile
  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    if (!profileDraft.fullName.trim()) {
      setProfileError('Full Name is required.');
      return;
    }

    setUserProfile((prev) => ({
      ...prev,
      fullName: profileDraft.fullName.trim(),
      email: profileDraft.email.trim() || prev.email,
      avatar: profileDraft.avatar.trim() || prev.avatar
    }));

    setProfileError('');
    setEditProfileOpen(false);
    setProfileSuccess('Profile updated successfully!');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  // Open Edit Document modal
  const handleOpenEditDoc = (doc) => {
    setEditDocModal(doc);
    setDocDraft({
      title: doc.title,
      subject: doc.subject || '',
      major: doc.major || ''
    });
    setDocError('');
  };

  // Save Edit Document
  const handleSaveDoc = (e) => {
    if (e) e.preventDefault();
    if (!docDraft.title.trim()) {
      setDocError('Document title is required.');
      return;
    }

    setUploadedDocs((prev) =>
      prev.map((d) =>
        d.id === editDocModal.id
          ? {
              ...d,
              title: docDraft.title.trim(),
              subject: docDraft.subject.trim() || d.subject,
              major: docDraft.major || d.major
            }
          : d
      )
    );

    setDocError('');
    setEditDocModal(null);
  };

  // Confirm Delete Document
  const handleConfirmDelete = () => {
    if (!deleteModalDoc) return;
    setUploadedDocs((prev) => prev.filter((d) => d.id !== deleteModalDoc.id));
    setDeleteModalDoc(null);
  };

  // Logout Interaction
  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="payt-profile-page">
      {/* Top Banner Header */}
      <div className="profile-banner sunrise-bg-soft">
        <div className="container profile-banner-container">
          <div className="profile-avatar-wrap">
            <img src={userProfile.avatar} alt={userProfile.fullName} className="profile-avatar" />
            <div className="avatar-badge">
              <CheckCircle2 size={18} className="verified-icon" />
            </div>
          </div>

          <div className="profile-title-block">
            <h1 className="profile-name">{userProfile.fullName}</h1>
            <p className="profile-email">{userProfile.email}</p>
            <div className="profile-role-pill">
              <Shield size={14} />
              <span>{userProfile.role}</span>
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
              onClick={() => navigate('/upload')}
            >
              Upload Material
            </Button>
          </div>
        </div>
      </div>

      <div className="container profile-body-container">
        {profileSuccess && (
          <div className="profile-success-alert">
            <CheckCircle2 size={18} className="success-icon" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {/* Account Summary Metrics */}
        <div className="profile-stats-grid">
          <div className="payt-card stat-card">
            <span className="stat-value">{uploadedDocs.length}</span>
            <span className="stat-label">Uploaded Documents</span>
          </div>
          <div className="payt-card stat-card">
            <span className="stat-value">{userProfile.stats.totalDownloads.toLocaleString()}</span>
            <span className="stat-label">Total Downloads Received</span>
          </div>
          <div className="payt-card stat-card">
            <span className="stat-value">{userProfile.stats.averageRating} ★</span>
            <span className="stat-label">Average Material Rating</span>
          </div>
        </div>

        {/* Account Information Details */}
        <div className="payt-card profile-info-card">
          <div className="info-card-header">
            <h3 className="section-title">Account Information</h3>
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
              <span className="item-label">Full Name</span>
              <span className="item-value">{userProfile.fullName}</span>
            </div>
            <div className="detail-item">
              <span className="item-label">Email Address</span>
              <span className="item-value">{userProfile.email}</span>
            </div>
            <div className="detail-item">
              <span className="item-label">Account Role</span>
              <span className="item-value">{userProfile.role}</span>
            </div>
            <div className="detail-item">
              <span className="item-label">Joined Date</span>
              <span className="item-value">{userProfile.joinedDate}</span>
            </div>
          </div>
        </div>

        {/* My Uploaded Documents Table/List */}
        <div className="payt-card profile-uploads-card">
          <div className="info-card-header">
            <h3 className="section-title">My Uploaded Documents</h3>
            <span className="uploads-count-badge">{uploadedDocs.length} items</span>
          </div>

          {uploadedDocs.length === 0 ? (
            <div className="empty-uploads">
              <FolderOpen size={48} className="text-orange" />
              <p className="empty-title">No uploaded documents yet</p>
              <p className="empty-subtext">Share your lecture notes or study guides with fellow students.</p>
              <Button variant="primary" size="sm" icon={Upload} onClick={() => navigate('/upload')}>
                Upload Your First Document
              </Button>
            </div>
          ) : (
            <div className="uploaded-list">
              {uploadedDocs.map((doc) => (
                <div key={doc.id} className="uploaded-item">
                  <div className="uploaded-item-main">
                    <div className="uploaded-file-icon">
                      <FileText size={22} className="text-orange" />
                    </div>
                    <div className="uploaded-file-text">
                      <Link to={`/documents/${doc.id}`} className="uploaded-title">
                        {doc.title}
                      </Link>
                      <div className="uploaded-submeta">
                        <span className="badge badge-major">{doc.major}</span>
                        <span>{doc.subject}</span>
                        <span>• {doc.fileSize}</span>
                        <span>• Uploaded {formatDate(doc.uploadDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="uploaded-item-actions">
                    <div className="uploaded-dl-count">
                      <Download size={14} /> {doc.downloads}
                    </div>
                    <Link to={`/documents/${doc.id}`}>
                      <button className="action-icon-btn" title="View Document">
                        <Eye size={16} />
                      </button>
                    </Link>
                    <button
                      type="button"
                      className="action-icon-btn"
                      title="Edit Document"
                      onClick={() => handleOpenEditDoc(doc)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      className="action-icon-btn danger"
                      title="Delete Document"
                      onClick={() => setDeleteModalDoc(doc)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Actions Bar */}
        <div className="profile-account-footer-actions">
          <Button variant="danger" size="md" icon={LogOut} onClick={handleLogout}>
            Logout Account
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModalDoc}
        onClose={() => setDeleteModalDoc(null)}
        title="Confirm Document Deletion"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setDeleteModalDoc(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={handleConfirmDelete}>
              Delete Document
            </Button>
          </>
        }
      >
        {deleteModalDoc && (
          <div className="delete-modal-content">
            <AlertTriangle size={36} className="warning-icon" />
            <p>
              Are you sure you want to delete <strong>"{deleteModalDoc.title}"</strong>?
            </p>
            <p className="subtext">
              This operation is permanent and cannot be undone.
            </p>
          </div>
        )}
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        title="Edit Profile Information"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveProfile} className="edit-profile-modal-form">
          <p className="modal-description">Update your personal account information.</p>
          <div className="avatar-edit-preview-wrapper">
            <img
              src={profileDraft.avatar || userProfile.avatar}
              alt="Avatar Preview"
              className="avatar-edit-preview"
            />
            <Input
              label="Avatar Image URL"
              placeholder="https://..."
              value={profileDraft.avatar}
              onChange={(e) => setProfileDraft((prev) => ({ ...prev, avatar: e.target.value }))}
              className="full-width-field"
            />
          </div>
          <div className="form-fields">
            <Input
              label="Full Name"
              value={profileDraft.fullName}
              onChange={(e) => {
                setProfileDraft((prev) => ({ ...prev, fullName: e.target.value }));
                if (profileError) setProfileError('');
              }}
              error={profileError}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={profileDraft.email}
              onChange={(e) => setProfileDraft((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Document Modal */}
      <Modal
        isOpen={!!editDocModal}
        onClose={() => setEditDocModal(null)}
        title="Edit Document Information"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setEditDocModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveDoc}>
              Save Changes
            </Button>
          </>
        }
      >
        {editDocModal && (
          <form onSubmit={handleSaveDoc} className="edit-profile-modal-form">
            <p className="modal-description">Update document title and academic metadata.</p>
            <div className="form-fields">
              <Input
                label="Document Title"
                value={docDraft.title}
                onChange={(e) => {
                  setDocDraft((prev) => ({ ...prev, title: e.target.value }));
                  if (docError) setDocError('');
                }}
                error={docError}
                required
              />
              <Input
                label="Course / Subject"
                value={docDraft.subject}
                onChange={(e) => setDocDraft((prev) => ({ ...prev, subject: e.target.value }))}
              />
              <Select
                label="Academic Major"
                options={MAJORS}
                value={docDraft.major}
                onChange={(e) => setDocDraft((prev) => ({ ...prev, major: e.target.value }))}
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Profile;
