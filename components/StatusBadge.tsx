import React from 'react';
import { GrievanceStatus } from '../types';

const statusStyles: Record<GrievanceStatus, string> = {
  [GrievanceStatus.SUBMITTED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [GrievanceStatus.ASSIGNED]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [GrievanceStatus.IN_REVIEW]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [GrievanceStatus.PENDING_APPROVAL]: 'bg-orange-100 text-orange-800 border-orange-200',
  [GrievanceStatus.RESOLVED]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  [GrievanceStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-200',
};

interface Props {
  status: GrievanceStatus;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
      {status}
    </span>
  );
};
