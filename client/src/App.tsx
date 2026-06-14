import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Callback from './pages/auth/Callback';
import MyOrders from './pages/public/MyOrders';
import RequestForm from './pages/public/RequestForm';
import Dashboard from './pages/admin/Dashboard';
import OrderDetail from './pages/public/OrderDetail.tsx';
import UsersList from './pages/admin/UsersList.tsx';
import ProtectedRoute from './components/forge/ProtectedRoute';
import AdminRoute from './components/forge/AdminRoute';
import Navbar from './components/forge/Navbar';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-body">
        {/* Navbar only shows when user is logged in and has access */}
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            {/* Public Gates */}
            <Route path="/" element={<RequestForm />} />
            <Route path="/auth/callback" element={<Callback />} />

            {/* Member Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/orders/:id" element={<OrderDetail />} />
              <Route path="/admin/users" element={<UsersList />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
