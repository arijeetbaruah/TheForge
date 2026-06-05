import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {getRedirectResult, onAuthStateChanged, signOut as firebaseSignOut} from "firebase/auth";
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
    // Process any pending Google redirect FIRST, before onAuthStateChanged
    getRedirectResult(auth)
        .then((result) => {
          if (result) {
            console.log("[Auth] Redirect result processed:", result.user.uid);
          }
        })
        .catch((err) => {
          console.error("[Auth] Redirect result error:", err);
          setError(err.message || "Google sign-in failed.");
        });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[Auth] onAuthStateChanged fired", firebaseUser?.uid ?? "no user");
      setLoading(true);
      setError(null);

      if (firebaseUser) {
        try {
          console.log("[Auth] Getting token...");
          let tokenResult = await firebaseUser.getIdTokenResult(true);
          let role = tokenResult.claims.role as UserRole;
          let discordId = tokenResult.claims.discordId as string;
          console.log("[Auth] Token claims:", { role, discordId });

          if (!role) {
            console.log("[Auth] No role — calling provision...");
            const token = await firebaseUser.getIdToken();
            const res = await fetch("/api/auth/provision", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            console.log("[Auth] Provision response status:", res.status);
            const body = await res.json();
            console.log("[Auth] Provision response body:", body);

            if (!res.ok) {
              console.error("[Auth] Provision failed — defaulting to 'user'");
              role = "user" as UserRole;
              discordId = "";
            } else {
              tokenResult = await firebaseUser.getIdTokenResult(true);
              role = (tokenResult.claims.role as UserRole) || "user";
              discordId = (tokenResult.claims.discordId as string) || "";
              console.log("[Auth] Claims after provision:", { role, discordId });
            }
          }

          console.log("[Auth] Setting user with role:", role);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Noble Smith",
            discordId: discordId || "",
            role: role || "user",
          });
        } catch (err: any) {
          console.error("[Auth] Caught error:", err);
          setError(err.message || "Failed to authenticate.");
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("[Auth] No firebase user — clearing state");
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
