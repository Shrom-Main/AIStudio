import React from 'react';
import { ActionRequiredItem } from '../types';
import { AlertTriangle, CheckCircle, ArrowRight, TrendingUp, ShieldAlert, DollarSign } from 'lucide-react';

interface ActionRequiredQueueProps {
  items: ActionRequiredItem[];
  onExecuteAction?: (item: ActionRequiredItem) => void;
}

export const ActionRequiredQueue: React.FC<ActionRequiredQueueProps> = ({ items, onExecuteAction }) => {
  const getVerbBadgeColor = (verb: ActionRequiredItem['action_verb']) => {
    switch (verb) {
      case 'SCALE':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
      case 'BUY':
        return 'text-blue-400 bg-blue-950/60 border-blue-800';
      case 'TEST':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800';
      case 'NEGOTIATE':
        return 'text-amber-400 bg-amber-950/60 border-amber-800';
      case 'HOLD':
      case 'KILL':
        return 'text-rose-400 bg-rose-950/60 border-rose-800';
      case 'MOVE_TO_B2B':
        return 'text-purple-400 bg-purple-950/60 border-purple-800';
      case 'MANUFACTURING_REVIEW':
        return 'text-indigo-400 bg-indigo-950/60 border-indigo-800';
      default:
        return 'text-slate-300 bg-slate-900 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-semibold tracking-wider text-slate-100 uppercase">
            Action Required · Decision Queue
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {items.length} critical commercial decisions pending
        </span>
      </div>

      <div className="space-y-3.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-md transition-all text-xs"
          >
            {/* Header: Urgency + Category + Action Verb */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-400 uppercase tracking-wider">{item.category}</span>
                <span aria-hidden="true" className="text-slate-600">/</span>
                <span className={item.urgency === 'HIGH' ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                  {item.urgency} PRIORITY
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-mono font-semibold border ${getVerbBadgeColor(
                    item.action_verb
                  )}`}
                >
                  {item.action_verb.replace(/_/g, ' ')}
                </span>
                {onExecuteAction && (
                  <button
                    onClick={() => onExecuteAction(item)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded font-medium transition-colors"
                  >
                    Execute
                  </button>
                )}
              </div>
            </div>

            {/* Structured Breakdown: Issue -> Evidence -> Action -> Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-0.5">
                  Issue
                </span>
                <p className="font-medium text-slate-200 leading-snug">{item.issue}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-0.5">
                  Evidence
                </span>
                <p className="text-slate-400 leading-snug">{item.evidence}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-0.5">
                  Recommended Action
                </span>
                <p className="text-amber-300/90 leading-snug font-medium">{item.recommended_action}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-0.5">
                  Expected Impact
                </span>
                <p className="text-emerald-400 leading-snug font-mono">{item.expected_impact}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
