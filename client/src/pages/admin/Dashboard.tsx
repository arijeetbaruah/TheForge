import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import StatusBadge from '../../components/forge/StatusBadge';
import { Shield, Sword, FlaskConical, Scroll, Gem, HelpCircle, Eye, BookOpen } from 'lucide-react';
import { Category, OrderStatus } from '../../types/order';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: orders, isLoading, error } = useOrders();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-heading text-xl text-primary p-6">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <span className="text-5xl animate-spin">⚙️</span>
          <span>Consulting Master Ledger...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 bg-card border-2 border-border text-center rounded-sm">
        <h2 className="font-heading text-2xl text-primary mb-4">Master Ledger Load Failure</h2>
        <p className="italic text-muted-foreground mb-6">"Could not read the master scroll. Check database link."</p>
      </div>
    );
  }

  // Filter orders
  const filteredOrders = (orders || []).filter((order) => {
    const categoryMatch = selectedCategory === 'ALL' || order.category === selectedCategory;
    const statusMatch = selectedStatus === 'ALL' || order.status === selectedStatus;
    const searchMatch =
      order.baseItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.enchantment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.discordUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.character.toLowerCase().includes(searchTerm.toLowerCase())
    return categoryMatch && statusMatch && searchMatch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Weapon': return <Sword className="w-4 h-4 text-primary" />;
      case 'Armor': return <Shield className="w-4 h-4 text-primary" />;
      case 'Poison': return <FlaskConical className="w-4 h-4 text-primary" />;
      case 'Consumable': return <Scroll className="w-4 h-4 text-primary" />;
      default: return <HelpCircle className="w-4 h-4 text-primary" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-10 border-b border-border/30 pb-6">
        <h1 className="font-heading text-3xl font-bold tracking-widest text-[#1a0f00] flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          GUILDMASTER MASTER LEDGER
        </h1>
        <p className="text-sm italic text-muted-foreground mt-1">
          "Review all pending blueprints, dispatch craftsmen, and manage community order queues."
        </p>
      </div>

      {/* Filters Ledger bar */}
      <div className="bg-[#f0d9a8]/50 border border-border p-5 mb-8 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <div className="flex flex-col flex-1 min-w-[200px]">
            <label className="font-heading text-[10px] tracking-wider uppercase text-muted-foreground mb-1">
              Search scroll or client
            </label>
            <input
              type="text"
              placeholder="e.g. Iron Broadsword, Merlin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card text-card-foreground border border-border rounded-sm py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-accent font-body text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-heading text-[10px] tracking-wider uppercase text-muted-foreground mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="bg-card text-card-foreground border border-border rounded-sm py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-accent font-heading text-xs tracking-wider"
            >
              <option value="ALL">ALL CATEGORIES</option>
              <option value="Weapon">WEAPONS</option>
              <option value="Armor">ARMOUR</option>
              <option value="Poison">POTIONS</option>
              <option value="Consumable">SCROLLS</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-heading text-[10px] tracking-wider uppercase text-muted-foreground mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-card text-card-foreground border border-border rounded-sm py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-accent font-heading text-xs tracking-wider"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="PENDING">PENDING</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="READY">READY</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>

        <div className="text-xs italic text-muted-foreground border-l border-border/40 pl-6 hidden md:block">
          Total Contracts: {filteredOrders.length}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-card border-2 border-border shadow-[3px_4px_10px_rgba(58,35,12,0.2)] overflow-x-auto rounded-sm relative">
        <div className="absolute inset-0.5 border border-dashed border-border/40 pointer-events-none rounded-sm" />
        
        <table className="w-full text-left border-collapse relative z-10">
          <thead>
            <tr className="border-b border-border bg-[#e8d09a]/40 font-heading text-xs tracking-widest text-[#1a0f00]">
              <th className="py-4 px-6 uppercase font-semibold">Client</th>
              <th className="py-4 px-6 uppercase font-semibold">Item Specification</th>
              <th className="py-4 px-6 uppercase font-semibold">Category</th>
              <th className="py-4 px-6 uppercase font-semibold text-center">Qty</th>
              <th className="py-4 px-6 uppercase font-semibold">Ordered</th>
              <th className="py-4 px-6 uppercase font-semibold text-center">Status</th>
              <th className="py-4 px-6 uppercase font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-sm font-body text-[#3b2a1a]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 px-6 text-center italic text-muted-foreground">
                  "No ledger entry matches thy current search or filters."
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-[#e8d09a]/20 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                >
                  <td className="py-4 px-6 font-semibold text-[#1a0f00]">
                    {order.discordUsername}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-[#1a0f00] line-clamp-1">{order.enchantment} - {order.baseItem}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="flex items-center gap-1.5 text-xs font-heading tracking-wider">
                      {getCategoryIcon(order.category)}
                      {order.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center font-bold">{order.quantity}</td>
                  <td className="py-4 px-6 text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="p-1.5 hover:text-accent rounded-sm text-primary transition-colors inline-flex items-center gap-1 font-heading text-xs tracking-wider bg-transparent border-none cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      INSPECT
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Dashboard;
