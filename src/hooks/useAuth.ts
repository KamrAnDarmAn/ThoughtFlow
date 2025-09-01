import { useState, useEffect } from "react";
import axios from "axios";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async (token) => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      console.log(
        "useAuth: Fetching user with token:",
        token.slice(0, 10) + "..."
      );
      const response = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newUser = response.data.user;
      console.log("useAuth: Fetched user:", newUser);
      // Only update if user data differs
      setUser((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(newUser)) {
          return newUser;
        }
        return prev;
      });
    } catch (error) {
      console.error("useAuth: Failed to fetch user:", error.message);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("useAuth: Logging out");
    localStorage.removeItem("token");
    setUser(null);
    setIsLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetchUser(token);

    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      console.log(
        "useAuth: Storage change, new token:",
        newToken?.slice(0, 10) + "..."
      );
      if (newToken !== token) {
        fetchUser(newToken);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return { user, logout, isLoading };
};
