import { Link } from 'react-router-dom';
import Button from '../../common/Button';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

export const ReviewSection = ({
  reviewTotalCount,
  isLoadingCurrentUser,
  currentUserId,
  myReview,
  handleSubmitReview,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  isSubmittingReview,
  reviewSubmitError,
  setReviewSubmitError,
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
  return (
    <div className="related-docs-section">
      {/* REVIEW HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <h2 className="section-title">Reviews</h2>
        <span className="badge badge-default">
          {reviewTotalCount} reviews
        </span>
      </div>

      {/* CURRENT USER CHECKING / FORM / PROMPT */}
      {isLoadingCurrentUser ? (
        <div
          className="payt-card"
          style={{
            marginBottom: '20px',
          }}
        >
          Checking your account...
        </div>
      ) : !currentUserId ? (
        /* NOT LOGGED IN */
        <div
          className="payt-card"
          style={{
            marginBottom: '20px',
          }}
        >
          <h3>Want to write a review?</h3>
          <p>Please log in before reviewing this document.</p>
          <Link to="/login">
            <Button variant="primary" size="sm">
              Login
            </Button>
          </Link>
        </div>
      ) : myReview ? (
        /* USER ALREADY HAS REVIEW */
        <div
          className="payt-card"
          style={{
            marginBottom: '20px',
          }}
        >
          <strong>You have already reviewed this document.</strong>
          <p
            style={{
              marginBottom: 0,
              marginTop: '6px',
              opacity: 0.75,
            }}
          >
            You can edit or delete your review below.
          </p>
        </div>
      ) : (
        /* CREATE REVIEW FORM */
        <ReviewForm
          handleSubmitReview={handleSubmitReview}
          reviewRating={reviewRating}
          setReviewRating={setReviewRating}
          reviewComment={reviewComment}
          setReviewComment={setReviewComment}
          isSubmittingReview={isSubmittingReview}
          reviewSubmitError={reviewSubmitError}
          setReviewSubmitError={setReviewSubmitError}
        />
      )}

      {/* REVIEW LIST */}
      <ReviewList
        isLoadingReviews={isLoadingReviews}
        reviewsError={reviewsError}
        reviews={reviews}
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
    </div>
  );
};

export default ReviewSection;
