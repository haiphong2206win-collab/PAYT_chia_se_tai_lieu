import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export const DeleteDocumentModal = ({
  isOpen,
  deleteModalDoc,
  isDeletingDoc,
  deleteError,
  onClose,
  onConfirmDelete,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Document Deletion"
      footer={
        <>
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isDeletingDoc}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={onConfirmDelete}
            loading={isDeletingDoc}
            disabled={isDeletingDoc}
          >
            {isDeletingDoc ? 'Deleting...' : 'Delete Document'}
          </Button>
        </>
      }
    >
      {deleteModalDoc && (
        <div className="delete-modal-content">
          <AlertTriangle size={36} className="warning-icon" />

          <p>
            Are you sure you want to delete{' '}
            <strong>"{deleteModalDoc.title}"</strong>?
          </p>

          <p className="subtext">
            This operation is permanent and cannot be undone.
          </p>

          {deleteError && (
            <p className="payt-input-error">{deleteError}</p>
          )}
        </div>
      )}
    </Modal>
  );
};

export default DeleteDocumentModal;
