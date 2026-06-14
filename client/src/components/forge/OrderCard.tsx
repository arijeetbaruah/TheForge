import React from 'react';
import { Link } from 'react-router-dom';
import {OrderDetail} from '../../types/order';
import StatusBadge from './StatusBadge';
import { Shield, Sword, FlaskConical, Scroll, HelpCircle } from 'lucide-react';

interface OrderCardProps {
  order: OrderDetail;
  isAdmin?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, isAdmin = false }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Weapon':
        return <Sword className="w-5 h-5 text-primary" />;
      case 'Armor':
        return <Shield className="w-5 h-5 text-primary" />;
      case 'Poison':
        return <FlaskConical className="w-5 h-5 text-primary" />;
      case 'Consumable':
        return <Scroll className="w-5 h-5 text-primary" />;
      default:
        return <HelpCircle className="w-5 h-5 text-primary" />;
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const detailPath = isAdmin ? `/admin/orders/${order.id}` : `/orders/${order.id}`;

  return (
    <div
      className="bg-card text-card-foreground border-2 border-border p-5 relative shadow-[2px_3px_8px_rgba(58,35,12,0.25)] transition-all hover:scale-[1.01] hover:shadow-[3px_4px_12px_rgba(58,35,12,0.35)]"
      style={{
        borderRadius: '3px 5px 2px 6px',
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.02) 100%)',
      }}
    >
      {/* Uneven hand-drawn border effect */}
      <div className="absolute inset-0.5 border border-dashed border-border/40 pointer-events-none rounded-sm" />

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex items-center gap-2">
          {getCategoryIcon(order.category)}
          <span className="font-heading text-xs tracking-wider text-muted-foreground uppercase">
            {order.category}
          </span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <h3 className="font-heading text-lg font-bold mb-1 text-foreground relative z-10">
        {order.enchantment} {order.baseItem}
      </h3>

      {order.discordId && isAdmin && (
        <div className="text-xs text-muted-foreground mb-2 relative z-10">
          Client: <span className="font-semibold text-foreground">{order.discordId}</span>
        </div>
      )}

      <p className="text-sm italic text-muted-foreground line-clamp-2 mb-4 relative z-10">
        {order.character}
      </p>

      <div className="flex justify-between items-center text-xs border-t border-border/30 pt-3 text-muted-foreground relative z-10">
        <div>
          <span>Qty: </span>
          <span className="font-bold text-foreground">{order.quantity}</span>
        </div>
        <div>
          <span>Ordered: </span>
          <span className="text-foreground">{formattedDate}</span>
        </div>
      </div>

      {order.adminNote && (
        <div className="mt-3 bg-primary/5 border border-primary/20 p-2 text-xs italic text-primary rounded-sm relative z-10">
          <strong>Guildmaster Note:</strong> {order.adminNote}
        </div>
      )}

      <div className="mt-4 flex justify-end relative z-10">
        <Link
          to={detailPath}
          className="font-heading text-xs tracking-widest text-primary border-b border-primary hover:text-accent hover:border-accent transition-colors py-0.5"
        >
          INSPECT BLUEPRINT →
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;
