export const DocumentInfo = ({
  document,
  formatDate,
  downloadCount,
}) => {
  if (!document) {
    return null;
  }

  return (
    <div className="detail-info-sections">

      {/* ABOUT */}

      <div className="payt-card info-card">

        <h3 className="info-card-title">
          About This Document
        </h3>

        <p className="info-card-description">
          {document.description}
        </p>

      </div>

      {/* INFO */}

      <div className="payt-card info-card">

        <h3 className="info-card-title">
          Document Information
        </h3>

        <div className="info-spec-grid">

          <div className="spec-item">

            <span className="spec-label">
              Category
            </span>

            <span className="spec-value">
              {document.major}
            </span>

          </div>

          <div className="spec-item">

            <span className="spec-label">
              Document Type
            </span>

            <span className="spec-value">
              {document.fileType}
            </span>

          </div>

          <div className="spec-item">

            <span className="spec-label">
              File Size
            </span>

            <span className="spec-value">
              {document.fileSize}
            </span>

          </div>

          <div className="spec-item">

            <span className="spec-label">
              Uploaded By
            </span>

            <span className="spec-value">

              {
                document
                  ?.uploader
                  ?.name
              }

            </span>

          </div>

          <div className="spec-item">

            <span className="spec-label">
              Upload Date
            </span>

            <span className="spec-value">

              {
                formatDate
                  ? formatDate(
                    document.uploadDate
                  )
                  : document.uploadDate
              }

            </span>

          </div>

          <div className="spec-item">

            <span className="spec-label">
              Downloads
            </span>

            <span className="spec-value">

              {
                (downloadCount ?? 0)
                  .toLocaleString()
              }

            </span>

          </div>

          <div className="spec-item">

            <span className="spec-label">
              Views
            </span>

            <span className="spec-value">

              {
                (document.views ?? 0)
                  .toLocaleString()
              }

            </span>

          </div>

          <div className="spec-item">

            <span className="spec-label">
              Reviews
            </span>

            <span className="spec-value">
              {
                document.reviewCount ?? 0
              }
            </span>

          </div>

        </div>

      </div>

    </div>
  );
};

export default DocumentInfo;
