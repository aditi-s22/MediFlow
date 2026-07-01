import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";
import * as userService from "../services/userService";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  // On first load, if a token exists from a previous session, fetch the
  // matching user so a page refresh doesn't log the user out.
  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await userService.getProfile();
        setUser(response.data.user);
      } catch (error) {
        // Token is invalid or expired — clear it
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { token: newToken, user: loggedInUser } = response.data;

    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(loggedInUser);

    return loggedInUser;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    const { token: newToken, user: newUser } = response.data;

    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);

    return newUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Lets pages like Profile push an updated user into context after a
  // successful PUT /api/users/profile, without re-fetching everything.
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook so components do `useAuth()` instead of importing useContext + AuthContext everywhere
const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
