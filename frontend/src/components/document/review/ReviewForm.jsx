import { Star } from 'lucide-react';
import Button from '../../common/Button';

export const ReviewForm = ({
  handleSubmitReview,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  isSubmittingReview,
  reviewSubmitError,
  setReviewSubmitError,
}) => {
  return (
    <div
      className="payt-card"
      style={{
        marginBottom: '20px',
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: '6px',
        }}
      >
        Write a Review
      </h3>

      <p
        style={{
          marginTop: 0,
          marginBottom: '20px',
          opacity: 0.75,
        }}
      >
        Share your experience with this study material.
      </p>

      <form onSubmit={handleSubmitReview}>
        {/* STAR RATING */}
        <div
          style={{
            marginBottom: '18px',
          }}
        >
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
            }}
          >
            Your Rating
          </label>

          <div
            style={{
              display: 'flex',
              gap: '7px',
              alignItems: 'center',
            }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} star rating`}
                disabled={isSubmittingReview}
                onClick={() => {
                  setReviewRating(star);
                  setReviewSubmitError('');
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '2px',
                  cursor: isSubmittingReview ? 'not-allowed' : 'pointer',
                }}
              >
                <Star
                  size={28}
                  className={star <= reviewRating ? 'star-icon' : ''}
                  fill={star <= reviewRating ? 'currentColor' : 'none'}
                />
              </button>
            ))}

            {reviewRating > 0 && (
              <span
                style={{
                  marginLeft: '6px',
                  fontWeight: 600,
                }}
              >
                {reviewRating} / 5
              </span>
            )}
          </div>
        </div>

        {/* COMMENT */}
        <div
          style={{
            marginBottom: '18px',
          }}
        >
          <label
            htmlFor="review-comment"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
            }}
          >
            Comment
          </label>

          <textarea
            id="review-comment"
            className="payt-textarea"
            rows={4}
            placeholder="Share your thoughts about this document..."
            value={reviewComment}
            disabled={isSubmittingReview}
            onChange={(e) => {
              setReviewComment(e.target.value);
              setReviewSubmitError('');
            }}
            style={{
              width: '100%',
            }}
          />
        </div>

        {/* CREATE ERROR */}
        {reviewSubmitError && (
          <p className="payt-input-error">{reviewSubmitError}</p>
        )}

        {/* SUBMIT */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmittingReview}
          disabled={isSubmittingReview}
        >
          {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </div>
  );
};

export default ReviewForm;
