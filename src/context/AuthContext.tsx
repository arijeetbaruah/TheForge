import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import type { AppUser, UserRole } from "../types";

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    try {
      // Force refresh the token to get the latest custom claims (roles / discordId)
      const tokenResult = await firebaseUser.getIdTokenResult(true);
      const role = (tokenResult.claims.role as UserRole) || "user";
      const discordId = (tokenResult.claims.discordId as string) || "";

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Noble Smith",
        discordId,
        role,
      });
    } catch (err: any) {
      console.error("Error refreshing user claims:", err);
      setError("Failed to sync user claims.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      if (firebaseUser) {
        try {
          // Check existing claims
          let tokenResult = await firebaseUser.getIdTokenResult();
          let role = tokenResult.claims.role as UserRole;
          let discordId = tokenResult.claims.discordId as string;

          // If no role is assigned, the user needs to be provisioned server-side
          if (!role) {
            const token = await firebaseUser.getIdToken();

            const res = await fetch("/api/auth/provision", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            if (!res.ok) {
              throw new Error("Failed to provision user on server.");
            }

            // Force refresh token to pull new claims from Firebase Auth
            tokenResult = await firebaseUser.getIdTokenResult(true);
            role = (tokenResult.claims.role as UserRole) || "user";
            discordId = (tokenResult.claims.discordId as string) || "";
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Noble Smith",
            discordId: discordId || "",
            role: role || "user",
          });
        } catch (err: any) {
          console.error("Authentication error:", err);
          setError(err.message || "Failed to authenticate.");
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err: any) {
      console.error("Sign out failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
