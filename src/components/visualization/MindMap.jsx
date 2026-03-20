/**
 * MARIAM PRO  MindMap (SVG radial)
 * Renders a radial mind-map from AI-generated data.
 */
import React from 'react';

const COLORS = ['#6366f1', '#a855f7', '#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#84cc16'];

export default function MindMap({ data }) {
  if (!data?.topic) return <div className="flex items-center justify-center h-full opacity-40 text-sm font-bold">No mind map data</div>;
  const branches = data.branches || [];
  const W = 700, H = 500, cx = W / 2, cy = H / 2, r1 = 160, r2 = 260;
  const branchAngles = branches.map((_, i) => ((2 * Math.PI * i) / branches.length) - (Math.PI / 2));

  return (
    <div className="w-full overflow-auto custom-scrollbar p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-[420px]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="mmBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.05" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          {branches.map((_, i) => (
            <marker key={i} id={`arrow${i}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill={COLORS[i % COLORS.length]} opacity="0.6" />
            </marker>
          ))}
        </defs>
        <rect width={W} height={H} fill="url(#mmBg)" rx="16" />

        {branches.map((branch, i) => {
          const ang = branchAngles[i]; const col = COLORS[i % COLORS.length];
          const bx = cx + r1 * Math.cos(ang), by = cy + r1 * Math.sin(ang);
          const subs = branch.subtopics || branch.children || [];
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={bx} y2={by} stroke={col} strokeWidth="2" strokeOpacity="0.5" strokeDasharray="4 2" />
              {subs.slice(0, 4).map((sub, j) => {
                const subCount = Math.min(subs.length, 4);
                const spanAngle = subCount > 1 ? (Math.PI / 3) : 0;
                const startAng = ang - (spanAngle / 2);
                const subAng = subCount > 1 ? startAng + (j / (subCount - 1)) * spanAngle : ang;
                const sx = cx + r2 * Math.cos(subAng), sy = cy + r2 * Math.sin(subAng);
                return (
                  <g key={j}>
                    <line x1={bx} y1={by} x2={sx} y2={sy} stroke={col} strokeWidth="1.5" strokeOpacity="0.3" />
                    <circle cx={sx} cy={sy} r="24" fill={col} fillOpacity="0.08" stroke={col} strokeWidth="1" strokeOpacity="0.3" />
                    <foreignObject x={sx - 30} y={sy - 18} width="60" height="36">
                      <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: '8px', textAlign: 'center', color: 'var(--text)', fontWeight: 700, lineHeight: 1.2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {typeof sub === 'string' ? sub : (sub.label || sub)}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
              <ellipse cx={bx} cy={by} rx="42" ry="20" fill={col} fillOpacity="0.15" stroke={col} strokeWidth="2" strokeOpacity="0.6" />
              <foreignObject x={bx - 40} y={by - 16} width="80" height="32">
                <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: '9px', textAlign: 'center', color: 'var(--text)', fontWeight: 800, lineHeight: 1.2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {branch.label}
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* Center node */}
        <circle cx={cx} cy={cy} r="50" fill="var(--accent)" fillOpacity="0.15" stroke="var(--accent)" strokeWidth="3" />
        <circle cx={cx} cy={cy} r="42" fill="var(--accent)" fillOpacity="0.2" />
        <foreignObject x={cx - 38} y={cy - 24} width="76" height="48">
          <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: '10px', textAlign: 'center', color: 'var(--accent)', fontWeight: 900, lineHeight: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', overflow: 'hidden' }}>
            {data.topic}
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
