import React from 'react';
import { OrderStatus } from '../../types/order';

interface StatusBadgeProps {
  status: OrderStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-[#e2ecf5] text-[#2c4e78] border-[#adbcd0] shadow-[inset_0_0_4px_rgba(44,78,120,0.15)]';
      case 'IN_PROGRESS':
        return 'bg-[#f7ebd0] text-[#a06a13] border-[#e4cc9a] shadow-[inset_0_0_4px_rgba(160,106,19,0.15)]';
      case 'COMPLETED':
        return 'bg-[#dbe6cf] text-[#3d5e27] border-[#bdd1a7] opacity-80';
      default:
        return 'bg-[#e8d09a] text-[#3b2a1a] border-[#c4a96a]';
    }
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-xs font-semibold uppercase border rounded-sm font-heading tracking-widest ${getStyles()}`}
      style={{
        transform: 'rotate(-1.5deg)',
        borderStyle: 'dashed',
        borderWidth: '1.5px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
