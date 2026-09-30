import React from 'react';
import { Compass, Users } from 'lucide-react';

interface RadarPulseProps {
  status: string;
  searchRadius?: number;
}

export const RadarPulse: React.FC<RadarPulseProps> = ({ status, searchRadius = 5 }) => {
  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 rounded-3xl overflow-hidden text-white shadow-xl">
      {/* Radar grid background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="w-full h-full border border-indigo-500/20 rounded-full scale-150" />
        <div className="w-full h-full border border-indigo-500/20 rounded-full scale-110" />
        <div className="w-full h-full border border-indigo-500/20 rounded-full scale-75" />
      </div>

      {/* Pulse Rings */}
      <div className="relative flex items-center justify-center w-48 h-48 my-6">
        <div className="absolute w-44 h-44 rounded-full bg-indigo-500/20 animate-pulse-ring" />
        <div className="absolute w-36 h-36 rounded-full bg-indigo-500/30 animate-ping" />
        <div className="absolute w-28 h-28 rounded-full bg-indigo-600/40" />

        {/* Center Target Indicator */}
        <div className="relative z-10 w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/50 border-2 border-white/80">
          <Compass className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      </div>

      <div className="relative z-10 text-center max-w-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          {status === 'ExpandingRadius' ? 'Radius Expanding' : 'Active Dispatch Radar'}
        </div>

        <h3 className="text-xl font-bold tracking-tight">
          {status === 'ExpandingRadius'
            ? `Expanding Radius to ${searchRadius} km`
            : `Locating Nearest Professionals within ${searchRadius} km`}
        </h3>

        <p className="mt-1 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          Notifying qualified service providers in your vicinity...
        </p>
      </div>
    </div>
  );
};

