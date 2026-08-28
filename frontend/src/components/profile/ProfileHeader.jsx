import React from 'react';
import { Shield, Edit3, Upload, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';

export const ProfileHeader = ({
  userProfile,
  onEditProfile,
  onUploadMaterial,
  variant = 'banner',
}) => {
  if (variant === 'info' || variant === 'account-info') {
    return (
      <div className="payt-card profile-info-card">
        <div className="info-card-header">
          <h3 className="section-title">Account Information</h3>
          <Button
            variant="ghost"
            size="sm"
            icon={Edit3}
            onClick={onEditProfile}
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
            <span className="item-value">
              {userProfile.joinedDate
                ? formatDate(userProfile.joinedDate)
                : 'Not available'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-banner sunrise-bg-soft">
      <div className="container profile-banner-container">
        <div className="profile-avatar-wrap">
          <img
            src={userProfile.avatar}
            alt={userProfile.fullName}
            className="profile-avatar"
          />
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
            onClick={onEditProfile}
          >
            Edit Profile
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Upload}
            onClick={onUploadMaterial}
          >
            Upload Material
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
