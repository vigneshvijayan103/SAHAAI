import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case 'completed':
      case 'verified':
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'inprogress':
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'searching':
      case 'expandingradius':
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse';
      case 'cancelled':
      case 'noworkersavailable':
      case 'inactive':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(
        status
      )} ${className}`}
    >
      {status}
    </span>
  );
};

