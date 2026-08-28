import api from "./api";


// 1. GET ALL DOCUMENTS


// GET DOCUMENTS
// GET /documents
//
// params có thể chứa:
// page
// limit
// categoryId
// sortBy
// order
// search (sẽ đối chiếu đúng contract khi test)

export const getDocumentsApi = async (
  params = {}
) => {
  const response = await api.get(
    '/documents',
    {
      params,
    }
  );

  return response.data;
};

// 2. GET DOCUMENT DETAIL


export const getDocumentByIdApi = async (documentId) => {
  const response = await api.get(
    `/documents/${documentId}`
  );

  return response.data;
};


// 3. UPLOAD DOCUMENT


export const uploadDocumentApi = async (formData) => {
  const response = await api.post(
    "/documents",
    formData
  );

  return response.data;
};


// 4. DOWNLOAD DOCUMENT


export const downloadDocumentApi = async (documentId) => {
  const response = await api.get(
    `/documents/${documentId}/download`,
    {
      responseType: "blob",
    }
  );

  return response;
};


// 5. CHECK DOCUMENT SAVED STATUS


export const getDocumentSaveStatusApi = async (documentId) => {
  const response = await api.get(
    `/documents/${documentId}/save`
  );

  return response.data;
};


// 6. SAVE DOCUMENT


export const saveDocumentApi = async (documentId) => {
  const response = await api.post(
    `/documents/${documentId}/save`
  );

  return response.data;
};


// 7. UNSAVE DOCUMENT


export const unsaveDocumentApi = async (documentId) => {
  const response = await api.delete(
    `/documents/${documentId}/save`
  );

  return response.data;
};


// edit document 
export const updateDocumentApi = async (documentId, data) => {
  const response = await api.patch(
    `/documents/${documentId}`,
    data
  );

  return response.data;
};


// delete document
export const deleteDocumentApi = async (documentId) => {
  const response = await api.delete(
    `/documents/${documentId}`
  );

  return response.data;
};


// GET DOCUMENT REVIEWS
// GET /documents/:documentId/reviews

export const getDocumentReviewsApi = async (
  documentId
) => {
  const response = await api.get(
    `/documents/${documentId}/reviews`
  );

  return response.data;
};


// CREATE DOCUMENT REVIEW
// POST /documents/:documentId/reviews

export const createDocumentReviewApi = async (
  documentId,
  reviewData
) => {
  const response = await api.post(
    `/documents/${documentId}/reviews`,
    reviewData
  );

  return response.data;
};


// UPDATE REVIEW
// PATCH /reviews/:reviewId

export const updateReviewApi = async (
  reviewId,
  reviewData
) => {
  const response = await api.patch(
    `/reviews/${reviewId}`,
    reviewData
  );

  return response.data;
};

// DELETE REVIEW
// DELETE /reviews/:reviewId

export const deleteReviewApi = async (
  reviewId
) => {
  const response = await api.delete(
    `/reviews/${reviewId}`
  );

  return response.data;
};