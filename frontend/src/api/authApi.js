import api from "./axios";

export const updateProfileApi = async (payload) => {
  const response = await api.put("/auth/profile", payload);
  return response.data;
};

export const changePasswordApi = async (payload) => {
  const response = await api.put("/auth/change-password", payload);
  return response.data;
};
