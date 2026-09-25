import React from 'react';
import { useStream } from '../context/StreamContext';
import { Radio, Play, Pause } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LiveBadge = () => {
  const { isStreaming, toggleStream } = useStream();
  const { isAdmin } = useAuth();

  return (
    <div className="flex items-center gap-2 bg-slate-100 border border-slate-200/90 rounded-full px-3 py-1 text-xs shadow-2xs">
      <div className="flex items-center gap-1.5">
        <span className={`h-2.5 w-2.5 rounded-full ${isStreaming ? 'bg-emerald-500 live-pulse' : 'bg-slate-400'}`}></span>
        <span className={`font-bold uppercase tracking-wider text-[11px] ${isStreaming ? 'text-emerald-700' : 'text-slate-500'}`}>
          {isStreaming ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>
      <span className="text-slate-300">|</span>
      <span className="text-slate-600 hidden sm:inline text-[11px] font-medium">
        {isStreaming ? 'Simulated Telemetry' : 'Stream Paused'}
      </span>
      {isAdmin && (
        <button
          onClick={toggleStream}
          title={isStreaming ? "Stop Live Stream" : "Start Live Stream"}
          className="ml-1 rounded-full p-1 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          {isStreaming ? <Pause className="h-3.5 w-3.5 text-amber-600" /> : <Play className="h-3.5 w-3.5 text-emerald-600" />}
        </button>
      )}
    </div>
  );
};

export default LiveBadge;