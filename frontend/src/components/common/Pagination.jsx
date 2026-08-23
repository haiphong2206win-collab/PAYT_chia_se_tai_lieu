import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

export const Pagination = ({
  currentPage = 1,
  totalPages = 5,
  onPageChange
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="payt-pagination">
      <button
        className="payt-page-btn payt-page-nav"
        disabled={currentPage === 1}
        onClick={() => onPageChange && onPageChange(currentPage - 1)}
        aria-label="Previous Page"
      >
        <ChevronLeft size={18} />
        <span>Previous</span>
      </button>

      <div className="payt-page-numbers">
        {pages.map((page) => (
          <button
            key={page}
            className={`payt-page-btn ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange && onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        className="payt-page-btn payt-page-nav"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange && onPageChange(currentPage + 1)}
        aria-label="Next Page"
      >
        <span>Next</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
