import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

export const EditProfileModal = ({
  isOpen,
  onClose,
  profileDraft,
  setProfileDraft,
  userProfile,
  profileError,
  setProfileError,
  isSavingProfile,
  onSaveProfile,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSavingProfile) {
          onClose();
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
                onClose();
              }
            }}
            disabled={isSavingProfile}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onSaveProfile}
            loading={isSavingProfile}
            disabled={isSavingProfile}
          >
            {isSavingProfile ? 'Saving...' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSaveProfile} className="edit-profile-modal-form">
        <p className="modal-description">
          Update your personal account information.
        </p>

        <div className="avatar-edit-preview-wrapper">
          <img
            src={profileDraft.avatar || userProfile?.avatar}
            alt="Avatar Preview"
            className="avatar-edit-preview"
          />

          <Input
            label="Avatar Image URL"
            placeholder="https://..."
            value={profileDraft.avatar}
            onChange={(e) =>
              setProfileDraft((prev) => ({
                ...prev,
                avatar: e.target.value,
              }))
            }
            className="full-width-field"
          />
        </div>

        <div className="form-fields">
          <Input
            label="Full Name"
            value={profileDraft.fullName}
            onChange={(e) => {
              setProfileDraft((prev) => ({
                ...prev,
                fullName: e.target.value,
              }));
              setProfileError('');
            }}
            error={profileError}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={profileDraft.email}
            onChange={(e) =>
              setProfileDraft((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
