import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/auth.js'

import 'bootstrap/dist/css/bootstrap.css'

import Home  from './Home/Home.jsx'
import Login from './Login.jsx'

function ProtectedRoute({ user, children }) {
    if (user === undefined) return null;
    if (user === null)      return <Navigate to="/login" replace />;
    return children;
}

function GuestRoute({ user, children }) {
    return children;
}

function AdminDashboard() {
    return (<>Hi</>);
}

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = { user: undefined };
    }

    componentDidMount() {
        this.unsubscribe = onAuthStateChanged(auth, (u) => {
            this.setState({ user: u ?? null });
        });
    }

    componentWillUnmount() {
        this.unsubscribe?.();
    }

    render() {
        const { user } = this.state;

        return (
            <BrowserRouter>
                <Routes>

                    {/* ── Guest routes ── */}
                    <Route path="/"      element={<GuestRoute user={user}><Home /></GuestRoute>} />
                    <Route path="/login" element={<GuestRoute user={user}><Login /></GuestRoute>} />

                    {/* ── Protected /admin/* routes ── */}
                    <Route
                        path="/admin"
                        element={<ProtectedRoute user={user}><Navigate to="/admin/dashboard" replace /></ProtectedRoute>}
                    />
                    <Route
                        path="/admin/*"
                        element={
                            <ProtectedRoute user={user}>
                                <Routes>
                                    <Route path="dashboard" element={<AdminDashboard />} />
                                    {/* <Route path="orders" element={<AdminOrders />} /> */}
                                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                                </Routes>
                            </ProtectedRoute>
                        }
                    />

                </Routes>
            </BrowserRouter>
        );
    }
}

export default App;