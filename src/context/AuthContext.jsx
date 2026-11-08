import { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    return authService
      .login(email, password)
      .then((loggedInUser) => {
        setUser(loggedInUser);
        return { success: true };
      })
      .catch((error) => {
        return { success: false, message: error.message };
      });
  };

  const register = (userData) => {
    return authService
      .register(userData)
      .then((newUser) => {
        setUser(newUser);
        return { success: true };
      })
      .catch((error) => {
        return { success: false, message: error.message };
      });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const contextValue = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "Admin",
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
