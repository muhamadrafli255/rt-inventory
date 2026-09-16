import api from "./axios";

export const getDashboard = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await api.get("/dashboard/summary");
  return response.data;
};

export const getLoanStatistics = async () => {
  const response = await api.get("/dashboard/loan-statistics");
  return response.data;
};

export const getPopularItems = async () => {
  const response = await api.get("/dashboard/popular-items");
  return response.data;
};

export const getRecentLoans = async () => {
  const response = await api.get("/dashboard/recent-loans");
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await api.get("/dashboard/admin");
  return response.data;
};

export const getWargaDashboard = async () => {
  const response = await api.get("/dashboard/warga");
  return response.data;
};