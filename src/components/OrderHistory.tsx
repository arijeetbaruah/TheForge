import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/firebase";
import type { Order } from "../types";
import { Scroll, ShieldAlert, Sparkles } from "lucide-react";

const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const token = await auth_token();
        const res = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Unable to retrieve your commission scroll.");
        }
        const data = await res.json();
        
        // Spec: Orders sorted by Submitted At descending
        const sorted = (data.orders || []).sort(
          (a: Order, b: Order) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
        setOrders(sorted);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load commissions ledger.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Helper to fetch current firebase user token
  const auth_token = async () => {
    return await auth.currentUser?.getIdToken() || "";
  };

  const getStatusBadgeClass = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-warning text-dark border-warning";
      case "In Progress":
        return "bg-info text-white border-info";
      case "Complete":
        return "bg-success text-white border-success";
      case "Cancelled":
        return "bg-danger text-white border-danger";
      default:
        return "bg-secondary text-white border-secondary";
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="parchment-scroll d-inline-block p-5" style={{ maxWidth: "400px" }}>
          <h2 className="mb-3">Reading Scroll</h2>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Unrolling thy past commissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="parchment-scroll">
        <div className="d-flex align-items-center gap-3 mb-4">
          <Scroll className="text-primary" size={36} />
          <h1 className="h2 font-medieval mb-0">Thy Commission History</h1>
        </div>

        <p className="lead text-muted">
          Here lies the ledger of all thy requests forged in fire. You are registered as Discord User: <code className="fw-bold">{user?.discordId || "None"}</code>.
        </p>

        {error && (
          <div className="alert alert-danger border-danger mb-4" role="alert">
            <div className="d-flex align-items-center gap-2">
              <ShieldAlert size={20} />
              <strong>Ledger Error: </strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-5 border rounded bg-light bg-opacity-10 my-4">
            <Sparkles className="text-muted mb-3" size={40} />
            <h4 className="font-medieval text-muted">No Orders Found</h4>
            <p className="small text-muted mb-0">Thy ledger is empty. Submit a new commission request!</p>
          </div>
        ) : (
          <div className="table-responsive mt-3">
            <table className="table table-hover text-ink align-middle font-monospace" style={{ fontSize: "0.95rem" }}>
              <thead>
                <tr className="font-medieval text-uppercase" style={{ letterSpacing: "1px" }}>
                  <th scope="col">Task ID</th>
                  <th scope="col">Character</th>
                  <th scope="col">Category</th>
                  <th scope="col">Item Details</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Status</th>
                  <th scope="col">Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.taskId} className="bg-transparent">
                    <td className="fw-bold text-muted small">{order.taskId.substring(0, 8)}...</td>
                    <td>{order.character}</td>
                    <td>
                      <span className="badge bg-secondary text-uppercase py-1 px-2">{order.category}</span>
                    </td>
                    <td>
                      <div>
                        <strong>{order.baseItem}</strong>
                        {order.providingBase && <span className="ms-2 text-success small">(Provided)</span>}
                      </div>
                      {order.enchantment && order.enchantment !== "None" && (
                        <div className="text-primary small d-flex align-items-center gap-1">
                          <Sparkles size={12} /> {order.enchantment}
                        </div>
                      )}
                    </td>
                    <td>{order.quantity}</td>
                    <td>
                      <span className={`badge border px-2 py-1 ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.submittedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
