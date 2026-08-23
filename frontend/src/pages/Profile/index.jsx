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
  AlertTriangle
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { MOCK_USER } from '../../mock/user';
import { formatDate } from '../../utils/formatters';
import './Profile.css';

export const Profile = () => {
  const navigate = useNavigate();
  const [user] = useState(MOCK_USER);
  const [deleteModalDoc, setDeleteModalDoc] = useState(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const handleConfirmDelete = () => {
    alert(`Phase 1 Demonstration: Deleted "${deleteModalDoc.title}" visually.`);
    setDeleteModalDoc(null);
  };

  const handleLogout = () => {
    alert('Phase 1 Demonstration: Logged out visually. Redirecting to Home...');
    navigate('/');
  };

  return (
    <div className="payt-profile-page">
      {/* Top Banner Header */}
      <div className="profile-banner sunrise-bg-soft">
        <div className="container profile-banner-container">
          <div className="profile-avatar-wrap">
            <img src={user.avatar} alt={user.fullName} className="profile-avatar" />
            <div className="avatar-badge">
              <CheckCircle2 size={18} className="verified-icon" />
            </div>
          </div>

          <div className="profile-title-block">
            <h1 className="profile-name">{user.fullName}</h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-role-pill">
              <Shield size={14} />
              <span>{user.role}</span>
            </div>
          </div>

          <div className="profile-banner-actions">
            <Button
              variant="secondary"
              size="md"
              icon={Edit3}
              onClick={() => setEditProfileOpen(true)}
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
        {/* Account Summary Metrics */}
        <div className="profile-stats-grid">
          <div className="payt-card stat-card">
            <span className="stat-value">{user.stats.totalUploads}</span>
            <span className="stat-label">Uploaded Documents</span>
          </div>
          <div className="payt-card stat-card">
            <span className="stat-value">{user.stats.totalDownloads.toLocaleString()}</span>
            <span className="stat-label">Total Downloads Received</span>
          </div>
          <div className="payt-card stat-card">
            <span className="stat-value">{user.stats.averageRating} ★</span>
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
              onClick={() => setEditProfileOpen(true)}
            >
              Edit
            </Button>
          </div>

          <div className="account-details-grid">
            <div className="detail-item">
              <span className="item-label">Full Name</span>
              <span className="item-value">{user.fullName}</span>
            </div>
            <div className="detail-item">
              <span className="item-label">Email Address</span>
              <span className="item-value">{user.email}</span>
            </div>
            <div className="detail-item">
              <span className="item-label">Account Role</span>
              <span className="item-value">{user.role}</span>
            </div>
            <div className="detail-item">
              <span className="item-label">Joined Date</span>
              <span className="item-value">{user.joinedDate}</span>
            </div>
          </div>
        </div>

        {/* My Uploaded Documents Table/List */}
        <div className="payt-card profile-uploads-card">
          <div className="info-card-header">
            <h3 className="section-title">My Uploaded Documents</h3>
            <span className="uploads-count-badge">{user.uploadedDocuments.length} items</span>
          </div>

          {user.uploadedDocuments.length === 0 ? (
            <div className="empty-uploads">
              <p>No documents uploaded yet.</p>
              <Button variant="primary" size="sm" icon={Upload} onClick={() => navigate('/upload')}>
                Upload Your First Document
              </Button>
            </div>
          ) : (
            <div className="uploaded-list">
              {user.uploadedDocuments.map((doc) => (
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
                      className="action-icon-btn"
                      title="Edit Document"
                      onClick={() => alert(`Edit metadata for "${doc.title}" (Phase 1 visual control).`)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
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

      {/* Edit Profile Modal Placeholder */}
      <Modal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        title="Edit Profile Information"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={() => {
              alert('Profile updated visually.');
              setEditProfileOpen(false);
            }}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="edit-profile-modal-form">
          <p className="modal-description">Update your personal account information.</p>
          <div className="form-fields">
            <div className="payt-input-group">
              <label className="payt-input-label">Full Name</label>
              <input type="text" className="payt-input" defaultValue={user.fullName} />
            </div>
            <div className="payt-input-group">
              <label className="payt-input-label">Email Address</label>
              <input type="email" className="payt-input" defaultValue={user.email} />
            </div>
            <div className="payt-input-group">
              <label className="payt-input-label">Academic Role</label>
              <input type="text" className="payt-input" defaultValue={user.role} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
