import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithRedirect, getRedirectResult  } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Shield, Sparkles } from "lucide-react";

const Login: React.FC = () => {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  useEffect(() => {
    getRedirectResult(auth)
        .then(async (result) => {
          if (result?.user) {
            await refreshUser();
            
            if (!loading && user) {
              if (user.role === "admin") {
                navigate("/admin");
              } else if (user.role === "member") {
                navigate("/forge");
              } else {
                navigate("/");
              }
            }
          }
        })
        .catch((err) => {
          setError(err.message || "Google sign-in failed.");
        });
  }, [user, loading, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAuthLoading(true);

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      await refreshUser();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid credentials. Verify your scrolls and try again.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This parchment is already signed. Try logging in.");
      } else if (err.code === "auth/weak-password") {
        setError("Thy password is too weak! A spell of 6 runes or more is required.");
      } else {
        setError(err.message || "An error occurred during authentication.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setAuthLoading(true);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
      setAuthLoading(false);
    }
  };

  if (loading || user) {
    return (
      <div className="parchment-container d-flex justify-content-center align-items-center">
        <div className="parchment-scroll text-center" style={{ maxWidth: "400px" }}>
          <h2 className="mb-3">Entering The Tavern</h2>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="parchment-container d-flex align-items-center justify-content-center">
      <div className="parchment-scroll w-100" style={{ maxWidth: "500px" }}>
        <div className="text-center mb-4">
          <Shield className="text-primary mb-2" size={48} />
          <h1 className="h2 font-medieval">Guild Ledger</h1>
          <p className="text-muted small">Sign the scrolls to access The Forge</p>
        </div>

        {error && (
          <div className="alert alert-danger font-monospace border-danger text-center small py-2" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="mb-4">
          <div className="mb-3">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="e.g. aldric@castle.realm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label" htmlFor="password">Security Rune (Password)</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="d-grid mb-3">
            <button
              type="submit"
              className="btn btn-wax-seal w-100"
              disabled={authLoading}
            >
              {authLoading ? "Casting Spell..." : isRegister ? "Sign Guild Ledger" : "Enter Tavern"}
            </button>
          </div>
        </form>

        <div className="medieval-divider">
          <span className="divider-symbol">⚔</span>
        </div>

        <div className="d-grid mb-4">
          <button
            type="button"
            className="btn btn-iron w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleGoogleAuth}
            disabled={authLoading}
          >
            <Sparkles size={18} />
            Sign in with Google
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            className="btn btn-link text-secondary text-decoration-none small"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister
              ? "Already signed the ledger? Enter Tavern here."
              : "New to the realm? Register your parchment here."}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
