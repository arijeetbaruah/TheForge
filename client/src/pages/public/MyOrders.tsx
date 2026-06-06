import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import OrderCard from '../../components/forge/OrderCard';
import { Plus, Info, BookOpen } from 'lucide-react';
import { Category, OrderStatus } from '../../types/order';

export const MyOrders: React.FC = () => {
  const { data: orders, isLoading, error } = useOrders();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-heading text-xl text-primary p-6">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <span className="text-5xl animate-spin">⚙️</span>
          <span>Reading Guild Ledgers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 bg-card border-2 border-border text-center rounded-sm">
        <h2 className="font-heading text-2xl text-primary mb-4">Ledger Retrieval Failure</h2>
        <p className="italic text-muted-foreground mb-6">"Alas, the ravens could not retrieve thy scrolls. Try again later."</p>
      </div>
    );
  }

  // Filter orders
  const filteredOrders = (orders || []).filter((order) => {
    const categoryMatch = selectedCategory === 'ALL' || order.category === selectedCategory;
    const statusMatch = selectedStatus === 'ALL' || order.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-border/30 pb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-widest text-[#1a0f00] flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            THY LEDGER OF COMMISSIONS
          </h1>
          <p className="text-sm italic text-muted-foreground mt-1">
            "Observe the state of thy crafting requests, from initial review to final forge."
          </p>
        </div>

        <Link
          to="/orders/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-heading tracking-widest text-xs rounded-sm hover:scale-[1.02] hover:bg-primary/95 transition-all shadow-[2px_3px_6px_rgba(0,0,0,0.3)] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          COMMISSION CRAFT
        </Link>
      </div>

      {/* Filters bar */}
      <div className="bg-[#f0d9a8]/50 border border-border p-4 mb-8 rounded-sm flex flex-wrap gap-4 items-center justify-between text-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col">
            <label className="font-heading text-[10px] tracking-wider uppercase text-muted-foreground mb-1">
              Filter Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="bg-card text-card-foreground border border-border rounded-sm py-1 px-3 focus:outline-none focus:ring-1 focus:ring-accent font-heading text-xs tracking-wider"
            >
              <option value="ALL">ALL CATEGORIES</option>
              <option value="Weapon">WEAPONS</option>
              <option value="Armor">ARMOUR</option>
              <option value="Consumable">CONSUMABLE</option>
              <option value="Poison">POISON</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-heading text-[10px] tracking-wider uppercase text-muted-foreground mb-1">
              Filter Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-card text-card-foreground border border-border rounded-sm py-1 px-3 focus:outline-none focus:ring-1 focus:ring-accent font-heading text-xs tracking-wider"
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

        <div className="text-xs italic text-muted-foreground">
          Showing {filteredOrders.length} of {orders?.length || 0} scroll(s)
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-card border-2 border-border p-12 text-center rounded-sm max-w-2xl mx-auto shadow-[2px_3px_8px_rgba(58,35,12,0.15)]">
          <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold mb-2">Thy Ledger is Empty</h3>
          <p className="text-sm italic text-muted-foreground mb-6">
            "No commission contracts match thy filters. Commission a new craft to set the anvil to work."
          </p>
          <Link
            to="/orders/new"
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-heading tracking-widest text-xs rounded-sm hover:scale-[1.02] hover:bg-primary/95 transition-all shadow-[2px_3px_6px_rgba(0,0,0,0.3)]"
          >
            SUMMON THE BLACKSMITH
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
