// "use client";

// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   type ReactNode,
// } from "react";
// import axios from "axios";
// import { parse } from "cookie"; // ✅ Parse cookies properly
// import { useRouter } from "next/navigation";

// interface User {
//   admin_id?: string;
//   lecturer_id?: string;
//   email: string;
//   name: string;
// }

// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   userType: "admin" | "lecturer" | null;
//   login: (credentials: LoginCredentials) => Promise<void>;
//   logout: () => void;
//   isAuthenticated: boolean;
//   loading: boolean;
// }

// interface LoginCredentials {
//   username: string;
//   password: string;
//   remember?: boolean;
// }

// interface LoginResponse {
//   access_token: string;
//   user: User;
//   user_type: "admin" | "lecturer";
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [userType, setUserType] = useState<"admin" | "lecturer" | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const cookieString = document.cookie;
//     const cookies = parse(cookieString);
//     const authState = cookies.authState ? JSON.parse(cookies.authState) : null;

//     if (authState?.token && authState?.userType) {
//       setToken(authState.token);
//       setUser(authState.user);
//       setUserType(authState.userType);
//       axios.defaults.headers.common["Authorization"] = `Bearer ${authState.token}`;
//     }

//     setLoading(false);
//   }, []);

//   const setAuthCookie = (authData: any, remember: boolean) => {
//     const cookieValue = JSON.stringify(authData);
//     document.cookie = `authState=${encodeURIComponent(cookieValue)}; Path=/; Max-Age=${remember ? 30 * 24 * 60 * 60 : 60 * 60}; SameSite=None; Secure`;
//     console.log("Auth Cookie Set Successfully:", document.cookie);
//   };

//   const clearAuthData = () => {
//     document.cookie = "authState=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
//     localStorage.removeItem("authState");
//     sessionStorage.removeItem("authState");
//     setToken(null);
//     setUser(null);
//     setUserType(null);
//     delete axios.defaults.headers.common["Authorization"];
//   };

//   const login = async (credentials: LoginCredentials): Promise<void> => {
//     try {
//       setLoading(true);

//       const response = await axios.post<LoginResponse>(
//         "/api/auth/login",
//         {
//           username: credentials.username,
//           password: credentials.password,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Accept: "application/json",
//           },
//           withCredentials: true,
//         }
//       );

//       const { access_token, user, user_type } = response.data;
//       const authState = { token: access_token, user, userType: user_type };

//       setAuthCookie(authState, credentials.remember ?? false);
//       setToken(access_token);
//       setUser(user);
//       setUserType(user_type);
//       axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

//       setTimeout(() => router.replace(`/dashboard/${authState.userType}`), 1500);
//     } catch (error) {
//       clearAuthData();
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = () => {
//     clearAuthData();
//     router.push("/login");
//   };

//   return <AuthContext.Provider value={{ user, token, userType, login, logout, isAuthenticated: !!token, loading }}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }


"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface User {
  admin_id?: string;
  lecturer_id?: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  userType: "admin" | "lecturer" | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userType, setUserType] = useState<"admin" | "lecturer" | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    const cookieString = document.cookie;
    const authState = getCookie("authState", cookieString);

    if (authState?.token && authState?.userType) {
      setToken(authState.token);
      setUser(authState.user);
      setUserType(authState.userType);
      axios.defaults.headers.common["Authorization"] = `Bearer ${authState.token}`;
    }
    setLoading(false);
  };

  const getCookie = (name: string, cookieString: string) => {
    const cookies = cookieString.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);

    return cookies[name] ? JSON.parse(cookies[name]) : null;
  };

  const setAuthCookie = (authData: any, remember: boolean) => {
    const cookieValue = JSON.stringify(authData);
    const maxAge = remember ? 30 * 24 * 60 * 60 : 60 * 60; // 30 days or 1 hour
    document.cookie = `authState=${encodeURIComponent(cookieValue)}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;
  };

  const clearAuthData = () => {
    document.cookie = "authState=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setToken(null);
    setUser(null);
    setUserType(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await axios.post("http://127.0.0.1:5000/api/auth/login", credentials);
      const { access_token, user, user_type } = response.data;

      const authState = { token: access_token, user, userType: user_type };
      setAuthCookie(authState, credentials.remember ?? false);
       localStorage.setItem("authState", JSON.stringify(authState));
      
      setToken(access_token);
      setUser(user);
      setUserType(user_type);
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      router.push(`/dashboard/${user_type}`);
    } catch (error) {
      clearAuthData();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    router.push("/login");
  };

  const value = {
    user,
    token,
    userType,
    login,
    logout,
    isAuthenticated: !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}