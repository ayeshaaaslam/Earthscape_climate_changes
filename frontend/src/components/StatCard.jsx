import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => {
  const iconColorMap = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
    rose: 'bg-rose-50 border-rose-100 text-rose-600',
    cyan: 'bg-cyan-50 border-cyan-100 text-cyan-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
  };

  const topBorderMap = {
    blue: 'border-t-blue-500',
    emerald: 'border-t-emerald-500',
    amber: 'border-t-amber-500',
    rose: 'border-t-rose-500',
    cyan: 'border-t-cyan-500',
    purple: 'border-t-purple-500',
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-200/90 border-t-2 ${topBorderMap[color] || 'border-t-cyan-500'} bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md shadow-xs`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`rounded-xl p-3 border shadow-xs ${iconColorMap[color] || iconColorMap.blue}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center text-xs font-semibold">
          <span className={trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
            {trend.value}
          </span>
          <span className="ml-1 text-slate-400 font-normal">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;