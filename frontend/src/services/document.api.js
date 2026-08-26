import api from "./api";


// 1. GET ALL DOCUMENTS


export const getDocumentsApi = async () => {
  const response = await api.get("/documents");

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