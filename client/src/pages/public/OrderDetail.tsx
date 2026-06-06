import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrder, useUpdateOrder, useDeleteOrder } from '../../hooks/useOrders.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import StatusBadge from '../../components/forge/StatusBadge.tsx';
import { ArrowLeft, Hammer, FileText, Trash2, Calendar, User, ShoppingBag } from 'lucide-react';
import { OrderStatus } from '../../types/order.ts';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const { data: order, isLoading, error } = useOrder(id || '');
  const updateOrderMutation = useUpdateOrder();
  const deleteOrderMutation = useDeleteOrder();

  const [status, setStatus] = useState<OrderStatus>('PENDING');
  const [adminNote, setAdminNote] = useState('');
  const [internalNote, setInternalNote] = useState('');

  // Sync state with order data
  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setAdminNote(order.adminNote || '');
      setInternalNote(order.internalNote || '');
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-heading text-xl text-primary p-6">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <span className="text-5xl animate-bounce">📜</span>
          <span>Unrolling Blueprint Scroll...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 bg-card border-2 border-border text-center rounded-sm">
        <h2 className="font-heading text-2xl text-primary mb-4">Contract Reading Failure</h2>
        <p className="italic text-muted-foreground mb-6">"This scroll could not be deciphered or does not exist."</p>
        <button
          onClick={() => navigate(isAdmin ? '/admin' : '/orders')}
          className="px-6 py-2 bg-primary text-primary-foreground font-heading tracking-widest text-xs rounded-sm hover:scale-[1.02] hover:bg-primary/95 transition-all cursor-pointer border-none"
        >
          RETURN TO SAFETY
        </button>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrderMutation.mutate({
      id: order.id,
      status,
      adminNote: adminNote || null,
      internalNote: internalNote || null,
    }, {
      onSuccess: () => {
        alert('Guild ledger updated successfully.');
      }
    });
  };

  const handleDelete = () => {
    if (window.confirm('Artisan, art thou certain thou wishes to strike this commission from the ledger forever?')) {
      deleteOrderMutation.mutate(order.id, {
        onSuccess: () => {
          navigate('/admin');
        }
      });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      
      {/* Return link */}
      <button
        onClick={() => navigate(isAdmin ? '/admin' : '/orders')}
        className="flex items-center gap-2 font-heading text-xs tracking-widest text-muted-foreground hover:text-primary mb-6 transition-colors bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        RETURN TO LEDGER
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Order Details Scroll */}
        <div
          className="lg:col-span-2 bg-card text-card-foreground p-8 md:p-12 border-2 border-border shadow-[4px_6px_20px_rgba(58,35,12,0.25)] relative"
          style={{
            borderRadius: '3px 5px 4px 6px',
            backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.01) 100%)',
          }}
        >
          <div className="absolute inset-1 border border-dashed border-border/40 pointer-events-none rounded-sm" />

          {/* Blueprint Title */}
          <div className="border-b-2 border-border/30 pb-6 mb-8">
            <div className="flex justify-between items-start flex-wrap gap-4 mb-2">
              <span className="font-heading text-xs tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                Craft Contract #{order.id.slice(-6).toUpperCase()}
              </span>
              <StatusBadge status={order.status} />
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-wide text-foreground">
              {order.enchantment} {order.baseItem}
            </h1>
          </div>

          {/* Details list */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="font-heading text-[10px] tracking-wider uppercase text-muted-foreground block">Date Inscribed</span>
                  <span className="font-semibold">{formatDate(order.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="font-heading text-[10px] tracking-wider uppercase text-muted-foreground block">Client Traveler</span>
                  <span className="font-semibold">{order.character} ({order.discordUsername})</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="font-heading text-[10px] tracking-wider uppercase text-muted-foreground block">Quantity Ordered</span>
                  <span className="font-bold text-md">{order.quantity}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#fcf8f0] p-6 border border-border/50 rounded-sm">
              <h3 className="font-heading text-xs tracking-wider uppercase text-muted-foreground mb-2">Additional Notes</h3>
              <p className="italic text-foreground whitespace-pre-line">
                {order.specialRequests ?? '--none--'}
              </p>
            </div>

            {/* Admin note (visible to member) */}
            {!isAdmin && order.adminNote && (
              <div className="bg-[#ebd3d3]/20 border border-[#d8aba8] p-4 rounded-sm">
                <h4 className="font-heading text-xs tracking-widest text-[#7d2c2c] font-bold mb-1">
                  GUILDMASTER'S SCRIP
                </h4>
                <p className="text-sm italic">{order.adminNote}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Guild Management Panel */}
        <div
          className="bg-card text-card-foreground p-6 md:p-8 border-2 border-border shadow-[3px_4px_12px_rgba(58,35,12,0.2)] relative flex flex-col justify-between"
          style={{
            borderRadius: '4px 3px 6px 5px',
          }}
        >
          <div className="absolute inset-1 border border-dashed border-border/40 pointer-events-none rounded-sm" />

          {isAdmin ? (
            /* Admin view: Edit details form */
            <form onSubmit={handleSave} className="space-y-6 relative z-10 w-full">
              <div className="text-center pb-4 border-b border-border/30 mb-4">
                <Hammer className="w-6 h-6 text-primary mx-auto mb-2" />
                <h2 className="font-heading text-lg font-bold tracking-widest uppercase">
                  GUILDMASTER CONTROL
                </h2>
              </div>

              {/* Status Select */}
              <div className="flex flex-col">
                <label className="font-heading text-[10px] tracking-wider uppercase text-muted-foreground mb-2">
                  Update Forge Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="bg-transparent text-foreground border-b-2 border-border py-2 px-1 focus:outline-none focus:border-accent font-body text-md cursor-pointer"
                >
                  <option value="PENDING">PENDING REVIEW</option>
                  <option value="ACCEPTED">ACCEPTED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="READY">READY FOR DELIVERY</option>
                  <option value="COMPLETED">COMPLETED & CLOSED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              {/* Guildmaster Note */}
              <div className="flex flex-col">
                <label className="font-heading text-[10px] tracking-wider uppercase text-muted-foreground mb-2">
                  Note to Traveler (Public)
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. Reject reason, delivery coordinates..."
                  className="bg-transparent text-foreground border-b-2 border-border py-2 px-1 focus:outline-none focus:border-accent font-body text-sm resize-none"
                />
              </div>

              {/* Internal Note */}
              <div className="flex flex-col">
                <label className="font-heading text-[10px] tracking-wider uppercase text-muted-foreground mb-2">
                  Artisan Archives (Admin Only)
                </label>
                <textarea
                  rows={3}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="e.g. Cost breakdown, materials needed..."
                  className="bg-transparent text-foreground border-b-2 border-border py-2 px-1 focus:outline-none focus:border-accent font-body text-sm resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  type="submit"
                  disabled={updateOrderMutation.isPending}
                  className="w-full py-2.5 bg-primary text-primary-foreground font-heading tracking-widest text-xs rounded-sm hover:scale-[1.01] hover:bg-primary/95 transition-all shadow-[2px_3px_6px_rgba(0,0,0,0.3)] cursor-pointer border-none"
                >
                  {updateOrderMutation.isPending ? 'SCRIBING LEDGER...' : 'RECORD CHANGES'}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteOrderMutation.isPending}
                  className="w-full py-2.5 bg-[#5e1010] text-primary-foreground font-heading tracking-widest text-xs rounded-sm hover:scale-[1.01] hover:bg-[#4a0d0d] transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  <Trash2 className="w-4 h-4" />
                  STRIKE CONTRACT
                </button>
              </div>
            </form>
          ) : (
            /* Member view: Read-only status panel */
            <div className="space-y-6 relative z-10 text-center py-6 w-full">
              <div className="pb-4 border-b border-border/30 mb-4">
                <Hammer className="w-8 h-8 text-primary mx-auto mb-2" />
                <h2 className="font-heading text-lg font-bold tracking-widest uppercase">
                  ORDER STATUS
                </h2>
              </div>

              <div className="py-4">
                <StatusBadge status={order.status} />
              </div>

              <div className="text-xs italic text-muted-foreground px-2">
                {order.status === 'PENDING' && '"Thy blueprint is currently awaiting review by the Guild Artisans."'}
                {order.status === 'ACCEPTED' && '"The Guild has accepted thy contract. Materials are being prepared."'}
                {order.status === 'IN_PROGRESS' && '"The forge fire burns hot! Thy item is currently being crafted."'}
                {order.status === 'READY' && '"Thy item is completed and ready for pickup. Deliver thy payment!"'}
                {order.status === 'COMPLETED' && '"Thy transaction is finalized, and this contract has been closed."'}
                {order.status === 'REJECTED' && '"The Guild has declined this commission. See the note below."'}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OrderDetail;
