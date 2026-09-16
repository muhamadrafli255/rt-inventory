import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );

  const [loading, setLoading] = useState(true);

  async function fetchCurrentUser(token = accessToken) {
    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const currentUser = response.data.data;

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("accessToken");

      return null;
    } finally {
      setLoading(false);
    }
  }

  async function login(credentials) {
    const response = await api.post(
      "/auth/login",
      credentials
    );

    const data = response.data.data;

    localStorage.setItem("accessToken", data.accessToken);

    setAccessToken(data.accessToken);
    setUser(data.user);

    return data;
  }

  async function register(payload) {
    const response = await api.post(
      "/auth/register",
      payload
    );

    return response.data;
  }

  async function refreshAccessToken() {
    try {
      const response = await api.post("/auth/refresh");

      const newAccessToken =
        response.data.data.accessToken;

      localStorage.setItem(
        "accessToken",
        newAccessToken
      );

      setAccessToken(newAccessToken);

      return newAccessToken;
    } catch (error) {
      localStorage.removeItem("accessToken");

      setAccessToken(null);
      setUser(null);

      return null;
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");

      setAccessToken(null);
      setUser(null);
    }
  }

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  async function updateProfile(payload) {
    const response = await api.put("/auth/profile", payload);
    const updatedUser = response.data.data;
    setUser(updatedUser);
    return updatedUser;
  }

  async function changePassword(payload) {
    const response = await api.put("/auth/change-password", payload);
    return response.data;
  }

  const value = {
    user,
    accessToken,
    loading,
    login,
    register,
    logout,
    refreshAccessToken,
    fetchCurrentUser,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth harus digunakan di dalam AuthProvider"
    );
  }

  return context;
}