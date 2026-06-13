"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { authService } from "@/services/auth.service";
import type {
  User,
  AuthState,
} from "@/types/auth.types";

const AuthContext =
  createContext<AuthState | null>(
    null
  );

export function AuthProvider({ children, }: { children: React.ReactNode; }) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const login = async (
    email: string,
    password: string
  ) => {
    const user =
      await authService.login({
        email,
        password,
      });

    setUser(user);
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await authService.getMe();
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx =
    useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}