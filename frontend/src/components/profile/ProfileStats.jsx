import React from 'react';

export const ProfileStats = ({
  uploadedCount,
  totalDownloads,
  averageRating,
}) => {
  return (
    <div className="profile-stats-grid">
      <div className="payt-card stat-card">
        <span className="stat-value">{uploadedCount}</span>
        <span className="stat-label">Uploaded Documents</span>
      </div>

      <div className="payt-card stat-card">
        <span className="stat-value">
          {typeof totalDownloads === 'number'
            ? totalDownloads.toLocaleString()
            : totalDownloads}
        </span>
        <span className="stat-label">Total Downloads Received</span>
      </div>

      <div className="payt-card stat-card">
        <span className="stat-value">{averageRating} ★</span>
        <span className="stat-label">Average Material Rating</span>
      </div>
    </div>
  );
};

export default ProfileStats;
