import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

export const EditDocumentModal = ({
  isOpen,
  editDocModal,
  onClose,
  docDraft,
  setDocDraft,
  docError,
  setDocError,
  isSavingDoc,
  isLoadingCategories,
  categories,
  onSaveDoc,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSavingDoc) {
          onClose();
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
                onClose();
              }
            }}
            disabled={isSavingDoc}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onSaveDoc}
            loading={isSavingDoc}
            disabled={isSavingDoc}
          >
            {isSavingDoc ? 'Saving...' : 'Save Changes'}
          </Button>
        </>
      }
    >
      {editDocModal && (
        <form onSubmit={onSaveDoc} className="edit-profile-modal-form">
          <p className="modal-description">
            Update document title, description and category.
          </p>

          <div className="form-fields">
            <Input
              label="Document Title"
              value={docDraft.title}
              onChange={(e) => {
                setDocDraft((prev) => ({
                  ...prev,
                  title: e.target.value,
                }));
                setDocError('');
              }}
              required
            />

            <div className="payt-input-group">
              <label className="payt-input-label">Description</label>
              <textarea
                className="payt-textarea"
                rows={4}
                value={docDraft.description}
                onChange={(e) =>
                  setDocDraft((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Document description"
              />
            </div>

            <div className="payt-input-group">
              <label className="payt-input-label">Document Category</label>
              <select
                className="payt-input"
                value={docDraft.categoryId}
                disabled={isLoadingCategories || isSavingDoc}
                onChange={(e) => {
                  setDocDraft((prev) => ({
                    ...prev,
                    categoryId: e.target.value,
                  }));
                  setDocError('');
                }}
              >
                <option value="">
                  {isLoadingCategories
                    ? 'Loading categories...'
                    : 'Select category'}
                </option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title ||
                      category.name ||
                      category.slug ||
                      'Category'}
                  </option>
                ))}
              </select>
            </div>

            {docError && (
              <p className="payt-input-error">{docError}</p>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EditDocumentModal;
