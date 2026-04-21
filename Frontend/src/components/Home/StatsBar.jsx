import React from 'react';

const stats = [
  { value: '10,000+', label: 'Students Enrolled',  color: '#FB0500' },
  { value: '98%',     label: 'Selection Rate',      color: '#0078FF' },
  { value: '50+',     label: 'Expert Faculty',      color: '#FB0500' },
  { value: '15+',     label: 'Years of Excellence', color: '#0078FF' },
];

const StatsBar = () => (
  <div className="bg-dot-dark py-8">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
      {stats.map((s) => (
        <div key={s.label} className="text-center px-4 py-1">
          <div className="text-2xl md:text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
          <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{s.label}</div>
        </div>
      ))}
    </div>
  </div>
);

export default StatsBar;
