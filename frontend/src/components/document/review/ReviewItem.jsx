import { Star, Edit3, Trash2 } from 'lucide-react';
import Button from '../../common/Button';
import ReviewEditForm from './ReviewEditForm';

export const ReviewItem = ({
  review,
  editingReviewId,
  isOwnReview,
  formatDate,
  handleOpenEditReview,
  deletingReviewId,
  handleDeleteReview,
  handleUpdateReview,
  editRating,
  setEditRating,
  editComment,
  setEditComment,
  isUpdatingReview,
  reviewActionError,
  setReviewActionError,
  handleCancelEditReview,
}) => {
  const isOwner = isOwnReview(review);
  const isEditing = editingReviewId === review.id;

  return (
    <div className="payt-card">
      {/* REVIEW HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
        }}
      >
        {/* USER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <img
            src={review.user.avatar}
            alt={review.user.name}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />

          <div>
            <strong>{review.user.name}</strong>

            {review.createdAt && (
              <div
                style={{
                  fontSize: '13px',
                  opacity: 0.7,
                  marginTop: '3px',
                }}
              >
                {formatDate(review.createdAt)}
              </div>
            )}
          </div>
        </div>

        {/* RATING */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <Star size={16} className="star-icon" fill="currentColor" />
          <strong>{review.rating.toFixed(1)}</strong>
          <span>/ 5.0</span>
        </div>
      </div>

      {/* EDIT MODE vs NORMAL VIEW */}
      {isEditing ? (
        <ReviewEditForm
          handleUpdateReview={handleUpdateReview}
          editRating={editRating}
          setEditRating={setEditRating}
          editComment={editComment}
          setEditComment={setEditComment}
          isUpdatingReview={isUpdatingReview}
          reviewActionError={reviewActionError}
          setReviewActionError={setReviewActionError}
          handleCancelEditReview={handleCancelEditReview}
        />
      ) : (
        <>
          <p
            style={{
              marginTop: '16px',
              marginBottom: isOwner ? '14px' : 0,
            }}
          >
            {review.content || 'No comment provided.'}
          </p>

          {/* OWNER ACTIONS */}
          {isOwner && (
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              {/* EDIT */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Edit3}
                disabled={deletingReviewId === review.id}
                onClick={() => handleOpenEditReview(review)}
              >
                Edit
              </Button>

              {/* DELETE */}
              <Button
                type="button"
                variant="danger"
                size="sm"
                icon={Trash2}
                loading={deletingReviewId === review.id}
                disabled={deletingReviewId === review.id}
                onClick={() => handleDeleteReview(review.id)}
              >
                {deletingReviewId === review.id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewItem;
