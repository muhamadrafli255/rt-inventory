import api from "./axios";

export const getItems = async (params = {}) => {
  const response = await api.get("/items", {
    params,
  });

  return response.data;
};

export const getItemById = async (id) => {
  const response = await api.get(`/items/${id}`);

  return response.data;
};

export const createItem = async (payload) => {
  const response = await api.post("/items", payload);

  return response.data;
};

export const updateItem = async (id, payload) => {
  const response = await api.patch(`/items/${id}`, payload);

  return response.data;
};

export const deleteItem = async (id) => {
  const response = await api.delete(`/items/${id}`);

  return response.data;
};