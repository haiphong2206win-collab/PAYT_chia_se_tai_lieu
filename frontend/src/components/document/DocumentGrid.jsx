import React from 'react';
import DocumentCard from './DocumentCard';
import './DocumentGrid.css';

export const DocumentGrid = ({ documents = [], loading = false, emptyMessage = 'No documents found.' }) => {
  if (loading) {
    return (
      <div className="payt-document-grid">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="payt-card doc-card-skeleton">
            <div className="skeleton-header"></div>
            <div className="skeleton-line lg"></div>
            <div className="skeleton-line sm"></div>
            <div className="skeleton-footer"></div>
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="payt-grid-empty payt-card">
        <div className="empty-icon-box">📄</div>
        <h3>{emptyMessage}</h3>
        <p>Try adjusting your search query or filter selections.</p>
      </div>
    );
  }

  return (
    <div className="payt-document-grid">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
};

export default DocumentGrid;
