import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/firebase";
import type { Order, AppUser, UserRole } from "../types";
import { Shield, Users, ClipboardList, Trash2, Edit3, RefreshCw } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [errorOrders, setErrorOrders] = useState<string | null>(null);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);

  // Filters for orders
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [discordFilter, setDiscordFilter] = useState<string>("");

  // Edit states
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");
  const [editAssignee, setEditAssignee] = useState<string>("");
  const [submittingOrderEdit, setSubmittingOrderEdit] = useState<boolean>(false);

  const [updatingUserUid, setUpdatingUserUid] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, [user]);

  const auth_token = async () => {
    return await auth.currentUser?.getIdToken() || "";
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setErrorOrders(null);
    try {
      const token = await auth_token();
      const res = await fetch("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Unable to fetch the master orders scroll.");
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      console.error(err);
      setErrorOrders(err.message || "Failed to load orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const token = await auth_token();
      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Unable to fetch the Guild Registry.");
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      console.error(err);
      setErrorUsers(err.message || "Failed to load guild users.");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle Order Status/Assignee Updates
  const handleStartEditOrder = (order: Order) => {
    setEditingOrderId(order.taskId);
    setEditStatus(order.status);
    setEditAssignee(order.assignee || "");
  };

  const handleSaveOrder = async (taskId: string) => {
    setSubmittingOrderEdit(true);
    try {
      const token = await auth_token();
      const res = await fetch(`/api/admin/orders/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: editStatus,
          assignee: editAssignee,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update order in registry.");
      }

      setEditingOrderId(null);
      await fetchOrders();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Could not update order.");
    } finally {
      setSubmittingOrderEdit(false);
    }
  };

  // Handle User Role Updates
  const handleUpdateRole = async (uid: string, targetRole: UserRole) => {
    if (uid === user?.uid) {
      alert("Thou cannot demote or alter thy own Admin claims!");
      return;
    }

    setUpdatingUserUid(uid);
    try {
      const token = await auth_token();
      const res = await fetch(`/api/admin/users/${uid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: targetRole,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to project new role.");
      }

      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update user role.");
    } finally {
      setUpdatingUserUid(null);
    }
  };

  // Handle User Banishing (DELETE)
  const handleDeleteUser = async (uid: string, displayName: string) => {
    if (uid === user?.uid) {
      alert("Thou cannot delete thyself!");
      return;
    }

    if (!window.confirm(`Are you certain you wish to banish ${displayName} from the guild? This revokes their login keys!`)) {
      return;
    }

    setUpdatingUserUid(uid);
    try {
      const token = await auth_token();
      const res = await fetch(`/api/admin/users/${uid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Banishment ritual collapsed.");
      }

      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete user.");
    } finally {
      setUpdatingUserUid(null);
    }
  };

  // Apply filters
  const filteredOrders = orders.filter((order) => {
    const statusMatch = !statusFilter || order.status === statusFilter;
    const categoryMatch = !categoryFilter || order.category === categoryFilter;
    const discordMatch = !discordFilter || order.discordId.toLowerCase().includes(discordFilter.toLowerCase());
    return statusMatch && categoryMatch && discordMatch;
  });

  return (
    <div className="container py-4">
      {/* Dashboard Title */}
      <div className="parchment-scroll border-primary mb-4" style={{ padding: "1.5rem 2rem" }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <Shield className="text-danger" size={40} />
            <h1 className="h2 font-medieval mb-0 text-danger">High Keep Control</h1>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-iron btn-sm d-flex align-items-center gap-2" onClick={() => { fetchOrders(); fetchUsers(); }}>
              <RefreshCw size={14} /> Refresh Ledgers
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Section 1: Orders Management */}
        <div className="col-12">
          <div className="parchment-scroll">
            <div className="d-flex align-items-center gap-2 mb-4">
              <ClipboardList className="text-primary" size={24} />
              <h2 className="h4 font-medieval mb-0">Master Commissions Ledger</h2>
            </div>

            {errorOrders && (
              <div className="alert alert-danger border-danger small" role="alert">
                {errorOrders}
              </div>
            )}

            {/* Filter Bar */}
            <div className="row g-3 mb-4 bg-dark bg-opacity-5 p-3 rounded font-monospace">
              <div className="col-md-3">
                <label className="form-label font-medieval small text-muted">Status</label>
                <select className="form-select form-select-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label font-medieval small text-muted">Category</label>
                <select className="form-select form-select-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="">All Categories</option>
                  <option value="Weapon">Weapon</option>
                  <option value="Armor">Armor</option>
                  <option value="Poison">Poison</option>
                  <option value="Consumable">Consumable</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label font-medieval small text-muted">Raven (Discord ID)</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Filter by Discord..."
                  value={discordFilter}
                  onChange={(e) => setDiscordFilter(e.target.value)}
                />
              </div>
            </div>

            {loadingOrders ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 font-monospace small">Consulting the Grand Scroll...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted font-monospace">No commissions match thy parameters.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle font-monospace" style={{ fontSize: "0.9rem" }}>
                  <thead>
                    <tr className="font-medieval text-uppercase">
                      <th>Task ID</th>
                      <th>Character / Discord</th>
                      <th>Category</th>
                      <th>Details</th>
                      <th>Quantity</th>
                      <th>Assignee</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const isEditing = editingOrderId === order.taskId;
                      return (
                        <tr key={order.taskId}>
                          <td className="fw-bold text-muted small">{order.taskId.substring(0, 8)}...</td>
                          <td>
                            <div className="fw-bold">{order.character}</div>
                            <div className="small text-muted">{order.discordId}</div>
                          </td>
                          <td>
                            <span className="badge bg-secondary text-uppercase">{order.category}</span>
                          </td>
                          <td>
                            <div>{order.baseItem}</div>
                            {order.enchantment && order.enchantment !== "None" && (
                              <div className="text-primary small">⭐ {order.enchantment}</div>
                            )}
                            {order.providingBase && <span className="text-success small fw-bold">(Provided)</span>}
                          </td>
                          <td>{order.quantity}</td>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={editAssignee}
                                onChange={(e) => setEditAssignee(e.target.value)}
                                placeholder="Unassigned"
                              />
                            ) : (
                              order.assignee || <span className="text-muted italic">Unassigned</span>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <select
                                className="form-select form-select-sm"
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Complete">Complete</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            ) : (
                              <span className={`badge border px-2 py-1 ${
                                order.status === "Pending" ? "bg-warning text-dark" :
                                order.status === "In Progress" ? "bg-info text-white" :
                                order.status === "Complete" ? "bg-success text-white" :
                                "bg-danger text-white"
                              }`}>
                                {order.status}
                              </span>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-success btn-sm px-2 py-1"
                                  onClick={() => handleSaveOrder(order.taskId)}
                                  disabled={submittingOrderEdit}
                                >
                                  Save
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm px-2 py-1"
                                  onClick={() => setEditingOrderId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                                onClick={() => handleStartEditOrder(order)}
                              >
                                <Edit3 size={12} /> Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Users Management */}
        <div className="col-12">
          <div className="parchment-scroll">
            <div className="d-flex align-items-center gap-2 mb-4">
              <Users className="text-primary" size={24} />
              <h2 className="h4 font-medieval mb-0">Guild Roll Call (Registry)</h2>
            </div>

            {errorUsers && (
              <div className="alert alert-danger border-danger small" role="alert">
                {errorUsers}
              </div>
            )}

            {loadingUsers ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 font-monospace small">Summoning the registry spirits...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle font-monospace" style={{ fontSize: "0.9rem" }}>
                  <thead>
                    <tr className="font-medieval text-uppercase">
                      <th>Unique Rune (UID)</th>
                      <th>Email Name</th>
                      <th>Signature (Name)</th>
                      <th>Raven (Discord ID)</th>
                      <th>Rank (Role)</th>
                      <th className="text-end">Actions / Ranks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.uid}>
                        <td className="text-muted small">{u.uid.substring(0, 8)}...</td>
                        <td>{u.email}</td>
                        <td>{u.displayName}</td>
                        <td>{u.discordId || <span className="text-muted small italic">None</span>}</td>
                        <td>
                          <span className={`badge border px-2 py-1 ${
                            u.role === "admin" ? "bg-danger border-danger text-white" :
                            u.role === "member" ? "bg-info border-info text-white" :
                            "bg-secondary border-secondary text-white"
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-1">
                            {/* Role management */}
                            {u.role === "user" && (
                              <button
                                className="btn btn-outline-info btn-sm"
                                onClick={() => handleUpdateRole(u.uid, "member")}
                                disabled={updatingUserUid === u.uid}
                              >
                                Promote to Member
                              </button>
                            )}

                            {u.role === "member" && (
                              <>
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => handleUpdateRole(u.uid, "user")}
                                  disabled={updatingUserUid === u.uid}
                                >
                                  Demote to User
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleUpdateRole(u.uid, "admin")}
                                  disabled={updatingUserUid === u.uid}
                                >
                                  Make Admin
                                </button>
                              </>
                            )}

                            {u.role === "admin" && (
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => handleUpdateRole(u.uid, "member")}
                                disabled={updatingUserUid === u.uid || u.uid === user?.uid}
                              >
                                Demote to Member
                              </button>
                            )}

                            {/* Banish user */}
                            <button
                              className="btn btn-danger btn-sm px-2"
                              onClick={() => handleDeleteUser(u.uid, u.displayName)}
                              disabled={updatingUserUid === u.uid || u.uid === user?.uid}
                              title="Banish from Guild"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
