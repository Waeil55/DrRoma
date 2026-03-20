import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Trophy, CalendarClock } from 'lucide-react';

export default function CalendarView({ flashcards, exams, tasks }) {
  const today = new Date();
  const [displayYear, setDisplayYear] = useState(today.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(today.getMonth());
  const [calMode, setCalMode] = useState('month');
  const [selectedDay, setSelectedDay] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  // Boards Countdown state
  const [examDate, setExamDate] = useState(() => localStorage.getItem('mariam_exam_date') || '');
  const [cdExpanded, setCdExpanded] = useState(false);

  const daysLeft = examDate
    ? Math.ceil((new Date(examDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000)
    : null;
  const totalCards = (flashcards || []).reduce((a, s) => a + (s.cards?.length || 0), 0);
  const cardsPerDay = daysLeft > 0 ? Math.max(15, Math.ceil(totalCards * 2 / daysLeft)) : 0;
  const urgencyColor = daysLeft === null ? 'var(--accent)'
    : daysLeft <= 7 ? 'var(--danger,#ef4444)'
    : daysLeft <= 30 ? '#f59e0b'
    : 'var(--success,#22c55e)';
  const saveExamDate = (val) => { setExamDate(val); if (val) localStorage.setItem('mariam_exam_date', val); else localStorage.removeItem('mariam_exam_date'); };

  const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  const eventMap = useMemo(() => {
    const map = {};
    const add = (dateMs, evt) => { if (!dateMs) return; const d = new Date(dateMs); const key = dateKey(d); if (!map[key]) map[key] = []; map[key].push(evt); };
    (flashcards || []).forEach(set => (set.cards || []).forEach(c => { if (c.nextReview) add(c.nextReview, { type: 'fsrs', label: `📚 ${set.title?.slice(0,20)}`, color: 'var(--accent)', time: c.nextReview }); }));
    (exams || []).forEach(ex => { if (ex.scheduledAt) add(ex.scheduledAt, { type: 'exam', label: `📝 ${ex.title?.slice(0,20)}`, color: 'var(--danger)', time: ex.scheduledAt }); });
    (tasks || []).forEach(t => { if (t.dueDate) add(new Date(t.dueDate).getTime(), { type: 'task', label: `✅ ${(t.title || t.text)?.slice(0,20)}`, color: 'var(--success)', time: new Date(t.dueDate).getTime() }); });
    return map;
  }, [flashcards, exams, tasks]);

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  const monthGrid = useMemo(() => {
    const first = new Date(displayYear, displayMonth, 1); const startDow = first.getDay(); const dim = new Date(displayYear, displayMonth + 1, 0).getDate(); const cells = [];
    for (let i = 0; i < 42; i++) { const dn = i - startDow + 1; if (dn < 1 || dn > dim) { cells.push(null); continue; } const d = new Date(displayYear, displayMonth, dn); const key = dateKey(d); cells.push({ dayNum: dn, key, date: d, events: eventMap[key] || [] }); }
    return cells;
  }, [displayYear, displayMonth, eventMap]);

  const weekDays = useMemo(() => {
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const key = dateKey(d);
      return { date: d, key, dayNum: d.getDate(), dayName: DAYS[d.getDay()], events: eventMap[key] || [] };
    });
  }, [weekOffset, eventMap]);

  const todayKey = dateKey(today);
  const prevMonth = () => { if (displayMonth === 0) { setDisplayMonth(11); setDisplayYear(y => y-1); } else setDisplayMonth(m => m-1); };
  const nextMonth = () => { if (displayMonth === 11) { setDisplayMonth(0); setDisplayYear(y => y+1); } else setDisplayMonth(m => m+1); };

  const navLabel = calMode === 'month' ? `${MONTHS[displayMonth]} ${displayYear}`
    : calMode === 'week' ? `${weekDays[0].date.toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${weekDays[6].date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`
    : selectedDay ? selectedDay.date.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}) : 'Select a day';

  const navPrev = () => { if (calMode === 'month') prevMonth(); else if (calMode === 'week') setWeekOffset(w => w-1); else if (selectedDay) { const d = new Date(selectedDay.date); d.setDate(d.getDate()-1); const key = dateKey(d); setSelectedDay({ date: d, key, dayNum: d.getDate(), events: eventMap[key] || [] }); } };
  const navNext = () => { if (calMode === 'month') nextMonth(); else if (calMode === 'week') setWeekOffset(w => w+1); else if (selectedDay) { const d = new Date(selectedDay.date); d.setDate(d.getDate()+1); const key = dateKey(d); setSelectedDay({ date: d, key, dayNum: d.getDate(), events: eventMap[key] || [] }); } };

  const openDay = (cell) => { setSelectedDay(cell); if (calMode !== 'day') setSheetOpen(true); };
  const switchToDay = (cell) => { setSelectedDay(cell); setCalMode('day'); setSheetOpen(false); };

  const selectedEvents = selectedDay ? (eventMap[selectedDay.key] || []) : [];

  const getHourForEvent = (ev) => ev.time ? new Date(ev.time).getHours() : 9;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content p-4" style={{ touchAction: 'pan-y' }}>

      {/* Boards Countdown Widget */}
      {!examDate ? (
        <button
          onClick={() => setCdExpanded(true)}
          className="w-full mb-4 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: 'var(--surface,var(--card))', border: '1.5px dashed var(--accent)', color: 'var(--accent)' }}
        >
          <CalendarClock size={18} />
          <span>Set boards exam date → get your daily study plan</span>
        </button>
      ) : (
        <div className="mb-4 rounded-2xl overflow-hidden" style={{ border: `2px solid ${urgencyColor}` }}>
          <button
            onClick={() => setCdExpanded(e => !e)}
            className="w-full flex items-center gap-3 px-4 py-3"
            style={{ background: `color-mix(in srgb, ${urgencyColor} 12%, var(--surface,var(--card)))` }}
          >
            <Trophy size={18} style={{ color: urgencyColor, flexShrink: 0 }} />
            <div className="flex-1 text-left">
              <span className="font-black text-sm" style={{ color: urgencyColor }}>
                {daysLeft > 0 ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} to Boards` : daysLeft === 0 ? 'Boards Today! 🏆' : 'Boards date passed'}
              </span>
              <span className="text-xs opacity-60 ml-2">{new Date(examDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
            </div>
            <span className="text-xs opacity-50">{cdExpanded ? '▲' : '▼'}</span>
          </button>
          {cdExpanded && (
            <div className="px-4 pb-4 pt-2 space-y-3" style={{ background: 'var(--surface,var(--card))' }}>
              {daysLeft > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl py-2 px-1" style={{ background: 'var(--card)' }}>
                      <div className="text-lg font-black" style={{ color: urgencyColor }}>{daysLeft}</div>
                      <div className="text-xs opacity-50">days left</div>
                    </div>
                    <div className="rounded-xl py-2 px-1" style={{ background: 'var(--card)' }}>
                      <div className="text-lg font-black" style={{ color: 'var(--accent)' }}>{cardsPerDay}</div>
                      <div className="text-xs opacity-50">cards/day</div>
                    </div>
                    <div className="rounded-xl py-2 px-1" style={{ background: 'var(--card)' }}>
                      <div className="text-lg font-black" style={{ color: 'var(--success,#22c55e)' }}>{Math.min(daysLeft, Math.ceil(daysLeft / 7))}</div>
                      <div className="text-xs opacity-50">mock exams</div>
                    </div>
                  </div>
                  <div className="rounded-xl px-3 py-2.5 text-xs space-y-1" style={{ background: 'var(--card)' }}>
                    <div className="font-bold opacity-70 mb-1">Daily Plan</div>
                    <div>📚 Review <strong>{cardsPerDay}</strong> flashcards</div>
                    {daysLeft > 7 && <div>📝 1 practice exam section/week</div>}
                    {daysLeft <= 7 && <div>🔥 Full mock exam today + weak areas</div>}
                    <div>💬 Ask tutor about unclear topics</div>
                  </div>
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs opacity-50 mb-1">
                      <span>Journey start</span><span>Boards day</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--card)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(2, Math.min(98, 100 - (daysLeft / 365) * 100))}%`, background: urgencyColor }} />
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center opacity-60 py-4 text-sm">{daysLeft === 0 ? '🎓 Good luck today!' : '🏁 Set a new exam date below.'}</p>
              )}
              <div className="flex items-center gap-2">
                <label className="text-xs opacity-60 shrink-0">Change date:</label>
                <input type="date" value={examDate} onChange={e => saveExamDate(e.target.value)}
                  className="flex-1 rounded-xl px-3 py-1.5 text-xs" style={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)' }} />
                <button onClick={() => { saveExamDate(''); setCdExpanded(false); }} className="text-xs opacity-50 hover:opacity-80 px-2">✕</button>
              </div>
            </div>
          )}
          {!cdExpanded && (
            <div className="px-4 pb-3" style={{ background: 'var(--surface,var(--card))' }}>
              <div className="text-xs opacity-60">Study <strong>{cardsPerDay}</strong> cards/day to stay on track</div>
            </div>
          )}
        </div>
      )}
      {/* Date picker shown inline when no date set and expanded */}
      {!examDate && cdExpanded && (
        <div className="mb-4 rounded-2xl p-4 space-y-3" style={{ background: 'var(--surface,var(--card))', border: '1.5px solid var(--border)' }}>
          <div className="text-sm font-bold">When is your boards exam?</div>
          <input type="date" value={examDate} min={new Date().toISOString().slice(0,10)} onChange={e => { saveExamDate(e.target.value); if (e.target.value) setCdExpanded(true); }}
            className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)' }} />
          <button onClick={() => setCdExpanded(false)} className="text-xs opacity-40">Cancel</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={navPrev} aria-label="Previous" className="glass w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80"><ChevronLeft size={16} /></button>
          <h2 className="text-lg font-bold min-w-[180px] text-center">{navLabel}</h2>
          <button onClick={navNext} aria-label="Next" className="glass w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80"><ChevronRight size={16} /></button>
        </div>
        <div className="flex gap-1 glass rounded-xl p-1">
          {['month','week','day'].map(m => (<button key={m} onClick={() => { setCalMode(m); if (m === 'day' && !selectedDay) { const key = todayKey; setSelectedDay({ date: new Date(today), key, dayNum: today.getDate(), events: eventMap[key] || [] }); } }} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all" style={calMode === m ? { background: 'var(--accent)', color: '#fff' } : { opacity: .5 }}>{m.charAt(0).toUpperCase()+m.slice(1)}</button>))}
        </div>
      </div>

      {/* Month View */}
      {calMode === 'month' && (<>
        <div className="grid grid-cols-7 mb-1">{DAYS.map(d => (<div key={d} className="text-center text-xs font-semibold opacity-40 py-1">{d}</div>))}</div>
        <div className="grid grid-cols-7 gap-0.5">
          {monthGrid.map((cell, i) => {
            if (!cell) return <div key={i} className="aspect-square" />;
            const isToday = cell.key === todayKey; const isSelected = selectedDay?.key === cell.key;
            return (<button key={cell.key} onClick={() => openDay(cell)} className="aspect-square rounded-xl p-1 flex flex-col items-center transition-all hover:opacity-90" style={{ background: isSelected ? 'var(--accent)' : isToday ? 'rgba(var(--acc-rgb,99,102,241),0.15)' : 'var(--surface,var(--card))', border: isToday ? '2px solid var(--accent)' : '2px solid transparent', color: isSelected ? '#fff' : 'var(--text)' }}>
              <span className="text-xs font-bold">{cell.dayNum}</span>
              <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">{cell.events.slice(0, 3).map((ev, ei) => (<div key={ei} className="w-1.5 h-1.5 rounded-full" style={{ background: ev.color }} />))}{cell.events.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />}</div>
            </button>);
          })}
        </div>
      </>)}

      {/* Week View */}
      {calMode === 'week' && (
        <div className="flex gap-1 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory' }}>
          {weekDays.map(day => {
            const isToday = day.key === todayKey;
            return (
              <div key={day.key} className="flex-1 min-w-[80px] rounded-2xl p-2 flex flex-col" style={{ scrollSnapAlign: 'start', background: isToday ? 'rgba(var(--acc-rgb,99,102,241),0.1)' : 'var(--surface,var(--card))', border: isToday ? '2px solid var(--accent)' : '1px solid var(--border)' }}>
                <div className="text-center mb-2">
                  <div className="text-xs font-semibold opacity-50">{day.dayName}</div>
                  <div className="text-lg font-bold" style={isToday ? { color: 'var(--accent)' } : {}}>{day.dayNum}</div>
                </div>
                <div className="flex-1 min-h-0 space-y-1">
                  {day.events.length === 0 && <div className="text-xs opacity-30 text-center py-4">—</div>}
                  {day.events.map((ev, ei) => (
                    <button key={ei} onClick={() => switchToDay(day)} className="w-full text-left px-2 py-1.5 rounded-lg text-xs truncate" style={{ background: 'var(--card)', borderLeft: `3px solid ${ev.color}` }}>
                      {ev.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day View */}
      {calMode === 'day' && selectedDay && (
        <div className="relative" style={{ minHeight: '600px' }}>
          {HOURS.map(h => (
            <div key={h} className="flex border-t" style={{ borderColor: 'var(--border)', height: '48px' }}>
              <div className="w-12 text-xs opacity-40 pt-1 text-right pr-2 shrink-0">{h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`}</div>
              <div className="flex-1 relative" />
            </div>
          ))}
          {/* Events positioned by hour */}
          {selectedEvents.map((ev, i) => {
            const hour = getHourForEvent(ev);
            return (
              <div key={i} className="absolute left-14 right-2 rounded-xl px-3 py-2 text-xs font-medium" style={{ top: `${hour * 48 + 4}px`, height: '40px', background: 'var(--surface,var(--card))', borderLeft: `4px solid ${ev.color}`, zIndex: 2 }}>
                <div className="truncate">{ev.label}</div>
                <div className="text-xs opacity-40 capitalize">{ev.type}</div>
              </div>
            );
          })}
          {selectedEvents.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm opacity-30">No events scheduled</p>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-4 flex-wrap">{[['FSRS Review','var(--accent)'],['Exam','var(--danger)'],['Task','var(--success)']].map(([label, color]) => (<div key={label} className="flex items-center gap-1.5 text-xs opacity-60"><div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />{label}</div>))}</div>

      {/* Day Detail Sheet (from month/week tap) */}
      {sheetOpen && selectedDay && calMode !== 'day' && (
        <div className="fixed inset-0 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 'var(--z-bottom-sheet, 120)' }} onClick={e => e.target === e.currentTarget && setSheetOpen(false)}>
          <div className="glass rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto" style={{ background: 'var(--card)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{selectedDay.date.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</h3>
              <div className="flex gap-2">
                <button onClick={() => switchToDay(selectedDay)} className="px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: 'var(--accent)', color: '#fff' }}>Day view</button>
                <button onClick={() => setSheetOpen(false)} aria-label="Close" className="w-8 h-8 glass rounded-xl flex items-center justify-center"><X size={14} /></button>
              </div>
            </div>
            {selectedEvents.length === 0 ? (<p className="text-sm opacity-40 text-center py-8">No events on this day</p>) : (<div className="space-y-2">{selectedEvents.map((ev, i) => (<div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }}><div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: ev.color }} /><span className="text-sm font-medium">{ev.label}</span><span className="text-xs opacity-40 ml-auto capitalize">{ev.type}</span></div>))}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}
