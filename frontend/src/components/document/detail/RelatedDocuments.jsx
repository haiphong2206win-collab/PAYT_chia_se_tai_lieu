import { FileText } from 'lucide-react';
import Button from '../../common/Button';
import DocumentCard from '../DocumentCard';

export const RelatedDocuments = ({
  isLoadingRelatedDocs,
  relatedDocsError,
  relatedDocs,
  loadRelatedDocuments,
}) => {
  return (
    <div className="related-docs-section">
      <h2 className="section-title">Related Documents</h2>

      {/* LOADING STATE */}
      {isLoadingRelatedDocs ? (
        <div className="payt-card payt-grid-empty">
          <FileText size={36} className="text-orange" />
          <h3>Loading related documents...</h3>
          <p>Finding more study materials in the same category.</p>
        </div>
      ) : relatedDocsError ? (
        /* ERROR STATE */
        <div className="payt-card payt-grid-empty">
          <FileText size={36} className="text-orange" />
          <h3>Unable to load related documents</h3>
          <p>{relatedDocsError}</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={loadRelatedDocuments}
          >
            Try Again
          </Button>
        </div>
      ) : relatedDocs.length === 0 ? (
        /* EMPTY STATE */
        <div className="payt-card payt-grid-empty">
          <FileText size={36} className="text-orange" />
          <h3>No related documents found</h3>
          <p>
            No other approved study materials are available in this category
            yet.
          </p>
        </div>
      ) : (
        /* SUCCESS STATE */
        <div className="responsive-grid-3">
          {relatedDocs.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatedDocuments;
