import { Star } from 'lucide-react';
import Button from '../../common/Button';

export const ReviewEditForm = ({
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
    <form
      onSubmit={handleUpdateReview}
      style={{
        marginTop: '18px',
      }}
    >
      {/* EDIT RATING */}
      <div
        style={{
          marginBottom: '14px',
        }}
      >
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 600,
          }}
        >
          Rating
        </label>

        <div
          style={{
            display: 'flex',
            gap: '7px',
          }}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={isUpdatingReview}
              aria-label={`${star} star rating`}
              onClick={() => {
                setEditRating(star);
                setReviewActionError('');
              }}
              style={{
                border: 'none',
                background: 'transparent',
                padding: '2px',
                cursor: isUpdatingReview ? 'not-allowed' : 'pointer',
              }}
            >
              <Star
                size={26}
                className={star <= editRating ? 'star-icon' : ''}
                fill={star <= editRating ? 'currentColor' : 'none'}
              />
            </button>
          ))}
        </div>
      </div>

      {/* EDIT COMMENT */}
      <textarea
        className="payt-textarea"
        rows={4}
        value={editComment}
        disabled={isUpdatingReview}
        onChange={(e) => {
          setEditComment(e.target.value);
          setReviewActionError('');
        }}
        style={{
          width: '100%',
        }}
      />

      {/* UPDATE ERROR */}
      {reviewActionError && (
        <p className="payt-input-error">{reviewActionError}</p>
      )}

      {/* EDIT BUTTONS */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginTop: '12px',
        }}
      >
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={isUpdatingReview}
          disabled={isUpdatingReview}
        >
          Save Changes
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isUpdatingReview}
          onClick={handleCancelEditReview}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ReviewEditForm;
