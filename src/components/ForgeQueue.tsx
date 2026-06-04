import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/firebase";
import type { Order } from "../types";
import { Flame, Check, ShieldAlert, User, Award, ClipboardList } from "lucide-react";

const ForgeQueue: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load orders
  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await auth_token();
      const res = await fetch("/api/forge/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to read the Guild's queue ledger.");
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load forge queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [user]);

  const auth_token = async () => {
    return await auth.currentUser?.getIdToken() || "";
  };

  // Find if user currently has an In Progress order claimed
  // Spec: Members may only hold one active (In Progress) order at a time
  const activeOrder = orders.find(
    (o) => o.status === "In Progress" && o.assignee === user?.displayName
  );

  const handleClaim = async (taskId: string) => {
    if (activeOrder) {
      alert("Thy hands are full! Complete thy current forge task before claiming another.");
      return;
    }

    setActionLoading(taskId);
    try {
      const token = await auth_token();
      const res = await fetch(`/api/forge/orders/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "claim",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "The anvil could not be claimed.");
      }

      await fetchQueue();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to claim order.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (taskId: string) => {
    setActionLoading(taskId);
    try {
      const token = await auth_token();
      const res = await fetch(`/api/forge/orders/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "complete",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Could not complete order.");
      }

      await fetchQueue();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to complete order.");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const inProgressOrders = orders.filter((o) => o.status === "In Progress");

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="parchment-scroll d-inline-block p-5" style={{ maxWidth: "400px" }}>
          <h2 className="mb-3">Consulting Ledger</h2>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Stoking the bellows, reading the queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* active job section if it exists */}
      {activeOrder && (
        <div className="parchment-scroll border-danger mb-4" style={{ borderStyle: "solid" }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <Flame className="text-danger animate-pulse" size={28} />
            <h2 className="h4 font-medieval mb-0 text-danger">Thy Active Forge Task</h2>
          </div>

          <div className="card p-3 border-secondary bg-light bg-opacity-10 mb-3">
            <div className="row align-items-center font-monospace">
              <div className="col-md-8">
                <h4 className="font-medieval h5 mb-1 text-ink">
                  {activeOrder.quantity}x {activeOrder.baseItem}{" "}
                  <span className="small text-muted">({activeOrder.category})</span>
                </h4>
                {activeOrder.enchantment && activeOrder.enchantment !== "None" && (
                  <div className="text-primary small mb-2">⭐ Enchantment: {activeOrder.enchantment}</div>
                )}
                <div className="small text-muted">
                  <strong>Character:</strong> {activeOrder.character} | <strong>Raven (Discord):</strong> {activeOrder.discordId}
                </div>
                <div className="small text-muted">
                  <strong>Lodged:</strong> {new Date(activeOrder.submittedAt).toLocaleString()}
                </div>
              </div>
              <div className="col-md-4 text-md-end mt-3 mt-md-0">
                <button
                  className="btn btn-wax-seal d-inline-flex align-items-center gap-2"
                  onClick={() => handleComplete(activeOrder.taskId)}
                  disabled={actionLoading === activeOrder.taskId}
                >
                  <Check size={18} />
                  {actionLoading === activeOrder.taskId ? "Completing..." : "Complete Forge Work"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="parchment-scroll">
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <ClipboardList className="text-primary" size={36} />
            <h1 className="h2 font-medieval mb-0">The Guild Forge Queue</h1>
          </div>
          <span className="badge bg-dark font-monospace text-gold p-2">
            Forge Status: Active
          </span>
        </div>

        {error && (
          <div className="alert alert-danger border-danger mb-4" role="alert">
            <div className="d-flex align-items-center gap-2">
              <ShieldAlert size={20} />
              <strong>Forge Fire Blocked: </strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="row">
          {/* Column 1: Pending Orders to Claim */}
          <div className="col-md-6 mb-4">
            <h3 className="font-medieval mb-3 border-bottom pb-2 text-ink d-flex align-items-center gap-2">
              <Flame size={20} className="text-warning" />
              Available Work ({pendingOrders.length})
            </h3>

            {pendingOrders.length === 0 ? (
              <div className="text-center py-5 border rounded bg-light bg-opacity-10">
                <p className="text-muted mb-0 font-monospace">All orders have been claimed. The anvil rests.</p>
              </div>
            ) : (
              pendingOrders.map((order) => (
                <div key={order.taskId} className="card p-3 mb-3 medieval-card">
                  <div className="d-flex justify-content-between align-items-start font-monospace">
                    <div>
                      <h5 className="font-medieval mb-1 text-ink">
                        {order.quantity}x {order.baseItem}
                      </h5>
                      <span className="badge bg-secondary text-uppercase py-1 mb-2">{order.category}</span>
                      {order.enchantment && order.enchantment !== "None" && (
                        <div className="text-primary small mb-2">⭐ {order.enchantment}</div>
                      )}
                      <div className="text-muted small">
                        <strong>For:</strong> {order.character} ({order.discordId})
                      </div>
                      {order.providingBase && (
                        <div className="text-success small fw-bold">✓ Client providing base item</div>
                      )}
                    </div>
                    <div className="text-end">
                      <button
                        className="btn btn-iron btn-sm mt-2"
                        onClick={() => handleClaim(order.taskId)}
                        disabled={!!activeOrder || actionLoading === order.taskId}
                      >
                        {actionLoading === order.taskId ? "Claiming..." : "Claim"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 2: In Progress Orders */}
          <div className="col-md-6 mb-4">
            <h3 className="font-medieval mb-3 border-bottom pb-2 text-ink d-flex align-items-center gap-2">
              <User size={20} className="text-info" />
              Being Forged ({inProgressOrders.length})
            </h3>

            {inProgressOrders.length === 0 ? (
              <div className="text-center py-5 border rounded bg-light bg-opacity-10">
                <p className="text-muted mb-0 font-monospace">No items are currently in the fire.</p>
              </div>
            ) : (
              inProgressOrders.map((order) => (
                <div key={order.taskId} className="card p-3 mb-3 border-info medieval-card bg-opacity-10">
                  <div className="font-monospace">
                    <div className="d-flex justify-content-between align-items-start">
                      <h5 className="font-medieval mb-1 text-ink">
                        {order.quantity}x {order.baseItem}
                      </h5>
                      <span className="badge bg-info text-white font-medieval py-1">In Progress</span>
                    </div>
                    {order.enchantment && order.enchantment !== "None" && (
                      <div className="text-primary small mb-2">⭐ {order.enchantment}</div>
                    )}
                    <div className="text-muted small">
                      <strong>Client:</strong> {order.character} | <strong>Raven:</strong> {order.discordId}
                    </div>
                    <div className="mt-2 pt-2 border-top border-secondary d-flex align-items-center gap-2 text-muted small">
                      <Award size={14} className="text-primary" />
                      <span>Assigned Smith: <strong>{order.assignee}</strong></span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgeQueue;
