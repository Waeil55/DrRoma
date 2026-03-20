/**
 * MARIAM PRO — Markdown Rendering Utilities
 * Extracts renderMdInline, renderMarkdown, UiTable, UiFlowchart,
 * UiCallout, and renderAIContent from App.jsx for reuse.
 */
import React from 'react';

/* ── Inline markdown → React elements ── */
export const renderMdInline = (text) => {
  if (!text) return [];
  const parts = [];
  const re = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`/g;
  let last = 0, k = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<b key={k++}><i>{m[1]}</i></b>);
    else if (m[2]) parts.push(<b key={k++}>{m[2]}</b>);
    else if (m[3]) parts.push(<i key={k++}>{m[3]}</i>);
    else if (m[4]) parts.push(
      <code key={k++} style={{ background: 'rgba(0,0,0,0.1)', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace', fontSize: '0.88em' }}>{m[4]}</code>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : [text];
};

/* ── Block markdown → React elements ── */
export const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  const out = [];
  let listItems = [];
  const flushList = () => {
    if (!listItems.length) return;
    out.push(<ul key={`ul${out.length}`} style={{ paddingLeft: 18, margin: '4px 0', listStyle: 'disc' }}>{listItems.splice(0)}</ul>);
  };
  lines.forEach((line, idx) => {
    const h3 = line.match(/^### (.+)$/);
    if (h3) { flushList(); out.push(<p key={idx} style={{ fontWeight: 800, margin: '10px 0 2px' }}>{renderMdInline(h3[1])}</p>); return; }
    const h2 = line.match(/^## (.+)$/);
    if (h2) { flushList(); out.push(<p key={idx} style={{ fontWeight: 800, fontSize: '1.05em', margin: '10px 0 3px' }}>{renderMdInline(h2[1])}</p>); return; }
    const h1 = line.match(/^# (.+)$/);
    if (h1) { flushList(); out.push(<p key={idx} style={{ fontWeight: 900, fontSize: '1.1em', margin: '12px 0 4px' }}>{renderMdInline(h1[1])}</p>); return; }
    const li = line.match(/^\s*[-*•+] (.+)$/) || line.match(/^\s*\d+\.\s+(.+)$/);
    if (li) { listItems.push(<li key={idx} style={{ marginBottom: 2, lineHeight: 1.5 }}>{renderMdInline(li[1])}</li>); return; }
    if (/^---+$/.test(line.trim())) { flushList(); out.push(<hr key={idx} style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.15)', margin: '8px 0' }} />); return; }
    if (!line.trim()) { flushList(); if (out.length) out.push(<div key={idx} style={{ height: 6 }} />); return; }
    flushList();
    out.push(<div key={idx} style={{ lineHeight: 1.6 }}>{renderMdInline(line)}</div>);
  });
  flushList();
  return <>{out}</>;
};

/* ── UI Table Component ── */
export const UiTable = ({ html }) => {
  const rows = [];
  const rowRe = /<ui-row>([\s\S]*?)<\/ui-row>/g;
  let rm;
  while ((rm = rowRe.exec(html)) !== null) {
    const rowHtml = rm[1];
    const headers = [], cols = [];
    const hRe = /<ui-col-header>([\s\S]*?)<\/ui-col-header>/g;
    const cRe = /<ui-col>([\s\S]*?)<\/ui-col>/g;
    let hm, cm;
    while ((hm = hRe.exec(rowHtml)) !== null) headers.push(hm[1].trim());
    while ((cm = cRe.exec(rowHtml)) !== null) cols.push(cm[1].trim());
    rows.push({ headers, cols });
  }
  if (!rows.length) return null;
  const headerRow = rows.find(r => r.headers.length);
  const dataRows = rows.filter(r => r.cols.length);
  return (
    <div style={{ overflowX: 'auto', margin: '14px 0', borderRadius: 12, border: '1px solid var(--border2,var(--border))', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88em' }}>
        {headerRow && (
          <thead>
            <tr>
              {headerRow.headers.map((h, ci) => (
                <th key={ci} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(var(--acc-rgb,99,102,241),0.12)', color: 'var(--accent)', borderBottom: '2px solid rgba(var(--acc-rgb,99,102,241),0.2)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {dataRows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid var(--border)', background: ri % 2 === 1 ? 'rgba(var(--acc-rgb,99,102,241),0.03)' : 'transparent' }}>
              {row.cols.map((c, ci) => (
                <td key={ci} style={{ padding: '9px 14px', color: ci === 0 ? 'var(--text)' : 'var(--text2)', fontWeight: ci === 0 ? 600 : 400, verticalAlign: 'top', lineHeight: 1.55 }}>{renderMdInline(c)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ── UI Flowchart Component ── */
const UI_NODE_COLORS = { blue: '#3b82f6', purple: '#8b5cf6', green: '#10b981', red: '#ef4444', orange: '#f97316', yellow: '#f59e0b', pink: '#ec4899', cyan: '#06b6d4', gray: '#6b7280' };

export const UiFlowchart = ({ html }) => {
  const nodes = {};
  const edges = [];
  const order = [];
  const nRe = /<ui-node\s[^>]*id="([^"]+)"[^>]*shape="([^"]+)"[^>]*color="([^"]+)"[^>]*>([\s\S]*?)<\/ui-node>/g;
  const eRe = /<ui-edge\s[^>]*from="([^"]+)"[^>]*to="([^"]+)"(?:[^>]*label="([^"]*)")?[^>]*\/>/g;
  let nm, em;
  while ((nm = nRe.exec(html)) !== null) {
    nodes[nm[1]] = { shape: nm[2], color: nm[3], label: nm[4].trim() };
    order.push(nm[1]);
  }
  while ((em = eRe.exec(html)) !== null) edges.push({ from: em[1], to: em[2], label: em[3] || '' });
  if (!order.length) return null;
  return (
    <div style={{ margin: '14px 0', padding: '18px 16px', borderRadius: 14, border: '1px solid var(--border2,var(--border))', background: 'var(--surface,rgba(255,255,255,0.03))', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        {order.map((id) => {
          const node = nodes[id];
          const col = UI_NODE_COLORS[node.color] || '#6366f1';
          const edgesFromHere = edges.filter(e => e.from === id);
          const isDiamond = node.shape === 'diamond';
          const isRound = node.shape === 'circle' || node.shape === 'oval';
          return (
            <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: isDiamond ? '12px 24px' : '10px 20px',
                  borderRadius: isRound ? '999px' : isDiamond ? '6px' : '10px',
                  transform: isDiamond ? 'rotate(45deg)' : 'none',
                  background: `${col}18`, border: `2px solid ${col}`,
                  fontWeight: 700, fontSize: '0.88em', color: col,
                  maxWidth: 340, textAlign: 'center', lineHeight: 1.35,
                  boxShadow: `0 3px 14px ${col}30`
                }}>
                  <span style={{ transform: isDiamond ? 'rotate(-45deg)' : 'none', display: 'block' }}>{node.label}</span>
                </div>
              </div>
              {edgesFromHere.map((edge, ei) => {
                const toCol = UI_NODE_COLORS[nodes[edge.to]?.color] || col;
                return (
                  <div key={ei} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {edge.label && <span style={{ fontSize: '0.75em', color: 'var(--text3)', fontStyle: 'italic', margin: '3px 0 0' }}>{edge.label}</span>}
                    <div style={{ position: 'relative', width: 2, height: 28, background: `linear-gradient(${col}, ${toCol})`, opacity: 0.55 }}>
                      <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `8px solid ${toCol}` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── UI Callout Component ── */
export const UiCallout = ({ type, children }) => {
  const map = {
    warning: { bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.35)', color: '#f59e0b', icon: '' },
    info:    { bg: 'rgba(14,165,233,.1)',  border: 'rgba(14,165,233,.35)', color: '#0ea5e9', icon: '' },
    success: { bg: 'rgba(16,185,129,.1)',  border: 'rgba(16,185,129,.35)', color: '#10b981', icon: '' },
    danger:  { bg: 'rgba(244,63,94,.08)',  border: 'rgba(244,63,94,.35)', color: '#f43f5e', icon: '' },
  };
  const s = map[type] || map.info;
  return (
    <div style={{ display: 'flex', gap: 10, padding: '10px 14px', margin: '10px 0', borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, lineHeight: 1.55 }}>
      <span style={{ fontSize: '1.1em', flexShrink: 0 }}>{s.icon}</span>
      <span style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.9em' }}>{children}</span>
    </div>
  );
};

/* ── renderAIContent: parses custom XML tags + standard markdown ── */
export const renderAIContent = (text) => {
  if (!text) return null;
  const segments = [];
  const tagRe = /(<ui-table>[\s\S]*?<\/ui-table>|<ui-flowchart(?:\s[^>]*)?>[\s\S]*?<\/ui-flowchart>|<ui-callout(?:\s[^>]*)?>[\s\S]*?<\/ui-callout>)/g;
  let last = 0, k = 0, m;
  while ((m = tagRe.exec(text)) !== null) {
    if (m.index > last) segments.push(<div key={k++}>{renderMarkdown(text.slice(last, m.index))}</div>);
    const tag = m[1];
    if (tag.startsWith('<ui-table')) {
      segments.push(<UiTable key={k++} html={tag} />);
    } else if (tag.startsWith('<ui-flowchart')) {
      segments.push(<UiFlowchart key={k++} html={tag} />);
    } else if (tag.startsWith('<ui-callout')) {
      const typeM = tag.match(/type="([^"]+)"/);
      const inner = tag.replace(/<ui-callout[^>]*>/, '').replace(/<\/ui-callout>/, '').trim();
      segments.push(<UiCallout key={k++} type={typeM?.[1] || 'info'}>{renderMdInline(inner)}</UiCallout>);
    }
    last = m.index + tag.length;
  }
  if (last < text.length) segments.push(<div key={k++}>{renderMarkdown(text.slice(last))}</div>);
  return <>{segments}</>;
};
