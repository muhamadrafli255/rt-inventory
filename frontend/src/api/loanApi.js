import api from "./axios";

export const getLoans = async (params = {}) => {
  const response = await api.get("/loans", {
    params,
  });

  return response.data;
};

export const getLoanById = async (id) => {
  const response = await api.get(`/loans/${id}`);

  return response.data;
};

export const createLoan = async (payload) => {
  const response = await api.post("/loans", payload);

  return response.data;
};

export const approveLoan = async (id) => {
  const response = await api.patch(`/loans/${id}/approve`);

  return response.data;
};

export const rejectLoan = async (id, payload) => {
  const response = await api.patch(`/loans/${id}/reject`, payload);

  return response.data;
};

export const borrowLoan = async (id) => {
  const response = await api.patch(`/loans/${id}/borrow`);

  return response.data;
};

export const returnLoan = async (id) => {
  const response = await api.patch(`/loans/${id}/return`);

  return response.data;
};

export const cancelLoan = async (id) => {
  const response = await api.patch(`/loans/${id}/cancel`);

  return response.data;
};