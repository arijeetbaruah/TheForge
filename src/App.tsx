import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import OrderForm from "./components/OrderForm";
import OrderHistory from "./components/OrderHistory";
import ForgeQueue from "./components/ForgeQueue";
import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/Login";
import { Swords, LogOut, Shield, Compass, BookOpen, User } from "lucide-react";

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-md navbar-dark medieval-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <Swords size={28} className="text-gold" />
          <span>The Forge</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#forgeNavbar"
          aria-controls="forgeNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="forgeNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-md-0 align-items-md-center">
            <li className="nav-item">
              <NavLink className="nav-link d-flex align-items-center gap-1" to="/">
                <Compass size={16} /> Commission Form
              </NavLink>
            </li>
            {user && (
              <li className="nav-item">
                <NavLink className="nav-link d-flex align-items-center gap-1" to="/orders">
                  <BookOpen size={16} /> Order History
                </NavLink>
              </li>
            )}
            {user && (user.role === "member" || user.role === "admin") && (
              <li className="nav-item">
                <NavLink className="nav-link d-flex align-items-center gap-1" to="/forge">
                  <Swords size={16} className="text-danger" /> Forge Queue
                </NavLink>
              </li>
            )}
            {user && user.role === "admin" && (
              <li className="nav-item">
                <NavLink className="nav-link d-flex align-items-center gap-1" to="/admin">
                  <Shield size={16} className="text-danger" /> Admin Keep
                </NavLink>
              </li>
            )}
          </ul>
          
          <div className="d-flex align-items-center gap-3 mt-3 mt-md-0 font-monospace text-gold small">
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <div className="text-md-end text-light">
                  <div className="fw-bold d-flex align-items-center gap-1 justify-content-end">
                    <User size={14} className="text-gold" /> {user.displayName}
                  </div>
                  <span className="badge bg-dark border-secondary text-gold text-uppercase" style={{ fontSize: '0.65rem' }}>
                    {user.role}
                  </span>
                </div>
                <button
                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                  onClick={logout}
                  style={{ borderStyle: "double" }}
                >
                  <LogOut size={14} /> Leave
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-iron btn-sm text-decoration-none">
                🔑 Enter Tavern
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="parchment-container d-flex flex-column min-vh-100 p-0">
          <Navigation />
          <main className="flex-grow-1 py-4">
            <Routes>
              {/* Public route */}
              <Route path="/" element={<OrderForm />} />
              <Route path="/login" element={<Login />} />

              {/* Protected user routes */}
              <Route
                path="/orders"
                element={
                  <ProtectedRoute allowedRoles={["user", "member", "admin"]}>
                    <OrderHistory />
                  </ProtectedRoute>
                }
              />

              {/* Protected member/admin routes */}
              <Route
                path="/forge"
                element={
                  <ProtectedRoute allowedRoles={["member", "admin"]}>
                    <ForgeQueue />
                  </ProtectedRoute>
                }
              />

              {/* Protected admin-only routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Link className="d-block text-center mt-5 font-medieval h3" to="/">Return to the Forge</Link>} />
            </Routes>
          </main>
          
          <footer className="py-3 bg-dark text-center font-monospace small text-gold border-top border-secondary mt-auto">
            &copy; 1442 The Forge Guild. All works handmade in coal and ash.
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
