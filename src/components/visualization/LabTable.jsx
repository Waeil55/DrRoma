/**
 * MARIAM PRO  LabTable
 * Styled table for lab results with H/L/C flags.
 */
import React from 'react';

export default function LabTable({ rows }) {
  if (!rows?.length) return null;
  return (
    <div className="rounded-xl overflow-hidden border border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))] mb-4 text-xs">
      <table className="w-full border-collapse">
        <thead><tr className="border-b border-[color:var(--border2,var(--border))]" style={{ background: 'var(--surface,var(--card))' }}>
          {['Test', 'Result', 'Range', 'Units'].map(h => (
            <th key={h} className="py-1.5 px-3 text-xs font-black uppercase tracking-wider text-left opacity-50">{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-[color:var(--border2,var(--border))]/50 last:border-0">
              <td className="py-2 px-3 font-semibold">{r.test}</td>
              <td className="py-2 px-3 text-center">
                <span className={`font-black inline-flex items-center gap-1 ${r.flag === 'L' ? 'lab-low' : r.flag === 'H' ? 'lab-high' : r.flag === 'C' ? 'lab-crit' : ''}`}>
                  {r.result}
                  {r.flag && <span className={`text-xs font-black px-1.5 py-0.5 rounded-md ${r.flag === 'L' ? 'badge-info' : r.flag === 'C' ? 'lab-crit' : 'badge-danger'} badge`} style={{ padding: '1px 5px' }}>{r.flag}</span>}
                </span>
              </td>
              <td className="py-2 px-3 text-center opacity-50 font-mono">{r.range}</td>
              <td className="py-2 px-3 text-center opacity-40 font-mono text-xs uppercase">{r.units}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
