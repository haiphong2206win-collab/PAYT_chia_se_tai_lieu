import api from "./api";

export const getUserProfileApi = async () => {
  const response = await api.get("/users/profile");

  return response.data;
};

export const updateUserProfileApi = async (userData) => {
  const response = await api.patch("/users/profile", userData);

  return response.data;
};

export const getMyDocumentsApi = async () => {
  const response = await api.get("/users/my-documents");

  return response.data;
};


// GET /users/saved-document
export const getSavedDocumentsApi = async () => {
  const response = await api.get(
    '/users/saved-document'
  );

  return response.data;
};