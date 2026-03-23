import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getCurrentUserId, logoutUser } from "@/lib/db/auth";
import { db } from "@/lib/db/connection";

type AuthUser = {
  id: number;
  name: string;
  email: string;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (userData: AuthUser) => {
    setUser(userData);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const userId = await getCurrentUserId();

        if (!userId) {
          setLoading(false);
          return;
        }

        const currentUser = db.getFirstSync(
          `SELECT id, name, email FROM users WHERE id = ? LIMIT 1`,
          [userId]
        ) as AuthUser | null;

        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Error restoring session:", error);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}