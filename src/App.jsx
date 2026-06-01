import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase/auth.js'
import UserService from './Entity/Userservice.js'

import 'bootstrap/dist/css/bootstrap.css'

import Home  from './Home/Home.jsx'
import Login from './Login.jsx'
// import Dashboard      from './Dashboard/Dashboard.jsx'
import AdminDashboard from './Admin/AdminDashboard.jsx'

// ── Route guards ──────────────────────────────────────────────────────────────

function GuestRoute({ user, children }) {
    return children;
}

function UserRoute({ user, children }) {
    if (user === undefined) return null;
    if (user === null)      return <Navigate to="/login" replace />;
    return children;
}

function AdminRoute({ user, children }) {
    if (user === undefined || user === null)      return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
    return children;
}

// ── Logout ────────────────────────────────────────────────────────────────────

class Logout extends React.Component {
    componentDidMount() {
        signOut(auth).catch((error) => console.error(error));
    }

    render() {
        return <Navigate to="/" replace />;
    }
}

// ── Placeholder pages (replace with real imports) ─────────────────────────────
function Dashboard()      { return <>Dashboard</>; }

// ── App ───────────────────────────────────────────────────────────────────────

class App extends React.Component {

    constructor(props) {
        super(props);
        // undefined = loading, null = logged out, object = { uid, email, role }
        this.state = { user: undefined };
    }

    async componentDidMount() {
        this.unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                this.setState({ user: null });
                return;
            }

            await UserService.initUser(firebaseUser.uid);
            const record = await UserService.getUser(firebaseUser.uid);

            this.setState({
                user: {
                    uid:   firebaseUser.uid,
                    email: firebaseUser.email,
                    role:  record?.role ?? 'user',
                },
            });
        });
    }

    componentWillUnmount() {
        this.unsubscribe?.();
    }

    render() {
        const { user } = this.state;

        if (user === undefined) return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );

        return (
            <BrowserRouter>
                <Routes>

                    {/* ── Guest routes ── */}
                    <Route path="/"      element={<GuestRoute user={user}><Home /></GuestRoute>} />
                    <Route path="/login" element={<GuestRoute user={user}><Login /></GuestRoute>} />
                    <Route path="/logout" element={<Logout />} />

                    {/* ── User routes ── */}
                    <Route
                        path="/dashboard"
                        element={<UserRoute user={user}><Dashboard /></UserRoute>}
                    />

                    {/* ── Admin routes ── */}
                    <Route
                        path="/admin"
                        element={<AdminRoute user={user}><Navigate to="/admin/dashboard" replace /></AdminRoute>}
                    />
                    <Route
                        path="/admin/*"
                        element={
                            <AdminRoute user={user}>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />

                    {/* ── Fallback ── */}
                    <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
            </BrowserRouter>
        );
    }
}

export default App;