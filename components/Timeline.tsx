import React from 'react';
import { WorkflowLog } from '../types';
import { CheckCircle2, Circle, Clock, User } from 'lucide-react';

interface Props {
  history: WorkflowLog[];
}

export const Timeline: React.FC<Props> = ({ history }) => {
  // Sort history: Newest on top
  const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 py-2">
      {sortedHistory.map((log, idx) => (
        <div key={log.id} className="ml-6 relative">
          <div className={`absolute -left-[33px] top-0 bg-white rounded-full p-1 border ${idx === 0 ? 'border-indigo-500' : 'border-gray-200'}`}>
             {idx === 0 ? <CheckCircle2 className="h-5 w-5 text-indigo-600" /> : <Circle className="h-5 w-5 text-gray-300" />}
          </div>
          <div className="flex flex-col bg-white rounded-lg border border-gray-100 shadow-sm p-3">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {log.status}
                    </span>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(log.timestamp).toLocaleString()}
                </span>
            </div>
            
            {log.note && (
                <p className="text-sm text-gray-600 mb-2 italic">"{log.note}"</p>
            )}

            <div className="flex items-center gap-2 mt-1 border-t border-gray-50 pt-2">
                <User size={12} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500">Updated by: {log.updatedBy}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};