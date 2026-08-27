import { MessageSquare } from 'lucide-react';
import ReviewItem from './ReviewItem';

export const ReviewList = ({
  isLoadingReviews,
  reviewsError,
  reviews,
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
  if (isLoadingReviews) {
    return (
      <div className="payt-card">
        <p>Loading reviews...</p>
      </div>
    );
  }

  if (reviewsError) {
    return (
      <div className="payt-card">
        <h3>Unable to load reviews</h3>
        <p>{reviewsError}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="payt-card payt-grid-empty">
        <MessageSquare size={36} className="text-orange" />
        <h3>No reviews yet</h3>
        <p>Be the first student to review this document.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: '16px',
      }}
    >
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          editingReviewId={editingReviewId}
          isOwnReview={isOwnReview}
          formatDate={formatDate}
          handleOpenEditReview={handleOpenEditReview}
          deletingReviewId={deletingReviewId}
          handleDeleteReview={handleDeleteReview}
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
      ))}
    </div>
  );
};

export default ReviewList;
