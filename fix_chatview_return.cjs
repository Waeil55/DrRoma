const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let f = fs.readFileSync(filePath, 'utf8');

const settingsPos = f.indexOf('function SettingsView');
const segment = f.slice(0, settingsPos);
const retPos = segment.lastIndexOf('  return (');

console.log(`retPos: ${retPos}, settingsPos: ${settingsPos}, gap: ${settingsPos - retPos}`);
console.log(`Broken content: ${JSON.stringify(f.slice(retPos, retPos + 80))}`);

// The new ChatView return block — full JSX
const newReturnBlock = `  return (
    <div className="flex-1 flex min-h-0 overflow-hidden" onClick={() => contextMenu && setContextMenu(null)}>
      {/* Project Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-md rounded-2xl p-5 shadow-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="text-base font-bold mb-3">Edit Project: {editingProject.name}</h3>
            <p className="text-xs opacity-50 mb-2">Custom Instructions (sent to AI before every message in this project)</p>
            <textarea
              className="w-full rounded-xl px-3 py-2 text-sm resize-none h-32 focus:outline-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
              value={editingProject.customInstructions || ''}
              onChange={e => setEditingProject(p => ({ ...p, customInstructions: e.target.value }))}
              placeholder="e.g. Always include drug doses. Focus on Step 2 CK. Use Egyptian medical context."
            />
            <div className="flex gap-2 mt-3 justify-end">
              <button onClick={() => setEditingProject(null)} className="px-4 py-1.5 rounded-xl text-sm opacity-60 hover:opacity-100" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>Cancel</button>
              <button onClick={() => {
                setProjects(p => p.map(x => x.id === editingProject.id ? { ...x, customInstructions: editingProject.customInstructions } : x));
                setEditingProject(null);
              }} className="px-4 py-1.5 rounded-xl text-sm font-bold" style={{ background: 'var(--accent)', color: '#fff' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div className="fixed z-50 rounded-xl shadow-2xl py-1 min-w-[140px]" style={{ top: contextMenu.y, left: contextMenu.x, background: 'var(--card)', border: '1px solid var(--border)' }}>
          <button className="w-full px-3 py-2 text-sm text-left hover:bg-[var(--accent)]/10 flex items-center gap-2"
            onClick={() => { setPinnedIds(p => p.includes(contextMenu.id) ? p.filter(x => x !== contextMenu.id) : [...p, contextMenu.id]); setContextMenu(null); }}>
            {pinnedIds.includes(contextMenu.id) ? '📌 Unpin' : '📌 Pin'}
          </button>
          <button className="w-full px-3 py-2 text-sm text-left hover:bg-[var(--accent)]/10 flex items-center gap-2" onClick={() => copySession(contextMenu.id)}>
            <Copy size={13} /> Copy chat
          </button>
          <button className="w-full px-3 py-2 text-sm text-left hover:bg-red-500/10 text-red-400 flex items-center gap-2" onClick={() => deleteSession(contextMenu.id)}>
            Delete
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside className={\`flex flex-col shrink-0 transition-all duration-300 overflow-hidden \${sidebarOpen ? 'w-64' : 'w-0'}\`} style={{ borderRight: sidebarOpen ? '1px solid var(--border)' : 'none', background: 'var(--card)' }}>
        {sidebarOpen && (<>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-3 pt-4 pb-2">
            <button onClick={newSession} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-medium hover:bg-[var(--accent)]/10 transition-colors" style={{ color: 'var(--accent)' }}>
              <Sparkles size={14} /> New Chat
            </button>
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-xl opacity-40 hover:opacity-80 transition-opacity">
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 pb-2">
            <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <Search size={13} className="opacity-40 shrink-0" />
              <input value={sessSearch} onChange={e => setSessSearch(e.target.value)} placeholder="Search chats…" className="flex-1 bg-transparent focus:outline-none text-xs" style={{ color: 'var(--text)' }} />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mx-3 mb-2 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {['chats', 'projects'].map(tab => (
              <button key={tab} onClick={() => setSidebarTab(tab)} className="flex-1 py-1.5 text-xs font-semibold capitalize transition-colors" style={{ background: sidebarTab === tab ? 'var(--accent)' : 'transparent', color: sidebarTab === tab ? '#fff' : 'var(--text3, var(--text))' }}>
                {tab === 'chats' ? '💬 Chats' : '📁 Projects'}
              </button>
            ))}
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5 custom-scroll">
            {sidebarTab === 'chats' && (<>
              {pinned.length > 0 && (<>
                <p className="px-2 py-1 text-xs font-bold opacity-40 uppercase tracking-wider">📌 Pinned</p>
                {pinned.map(s => <SessionItem key={s.id} s={s} />)}
                <div className="my-1.5 border-t" style={{ borderColor: 'var(--border)' }} />
              </>)}
              {Object.entries(grouped).map(([g, items]) => items.length > 0 && (
                <div key={g}>
                  <p className="px-2 py-1 text-xs font-bold opacity-40 uppercase tracking-wider">{g}</p>
                  {items.map(s => <SessionItem key={s.id} s={s} />)}
                </div>
              ))}
              {filteredSessions.length === 0 && (
                <p className="text-xs opacity-30 text-center py-6">No chats yet</p>
              )}
            </>)}

            {sidebarTab === 'projects' && (<>
              {projects.map(p => (
                <div key={p.id}
                  className={\`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all group \${selProject === p.id ? 'bg-[var(--accent)]/10 border border-[var(--accent)]/20' : 'hover:bg-[var(--accent)]/6 border border-transparent'}\`}
                  onClick={() => setSelProject(selProject === p.id ? null : p.id)}>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className={\`flex-1 text-sm font-medium truncate \${selProject === p.id ? 'text-[var(--accent)] font-bold' : ''}\`}>{p.name}</span>
                  <button onClick={e => { e.stopPropagation(); setEditingProject({ ...p }); }}
                    className="opacity-0 group-hover:opacity-60 hover:!opacity-100 p-1 rounded-lg hover:bg-[var(--accent)]/10 shrink-0">
                    <PenLine size={12} />
                  </button>
                </div>
              ))}
              <button onClick={() => setShowNewProject(v => !v)}
                className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-xl text-sm opacity-60 hover:opacity-100 hover:bg-[var(--accent)]/8 transition-colors border border-dashed"
                style={{ borderColor: 'var(--border)' }}>
                + New Project
              </button>
              {showNewProject && (
                <div className="mt-2 px-1 space-y-2">
                  <input
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && createProject()}
                    placeholder="Project name…"
                    className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--accent)', color: 'var(--text)' }}
                  />
                  <textarea
                    value={newProjectInstructions}
                    onChange={e => setNewProjectInstructions(e.target.value)}
                    placeholder="Custom instructions (optional)…"
                    className="w-full rounded-xl px-3 py-2 text-sm resize-none h-20 focus:outline-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                  <button onClick={createProject} className="w-full py-1.5 rounded-xl text-sm font-bold" style={{ background: 'var(--accent)', color: '#fff' }}>
                    Create
                  </button>
                </div>
              )}
            </>)}
          </div>
        </>)}
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Top Bar */}
        <div className="flex items-center gap-2 px-3 py-2 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-xl opacity-50 hover:opacity-100 transition-opacity">
              <AlignLeft size={18} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            {selProject && (() => {
              const p = projects.find(x => x.id === selProject);
              return p ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: p.color + '22', color: p.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  {p.name}
                </span>
              ) : null;
            })()}
            {!selProject && curSessData && (
              <p className="text-sm font-semibold truncate opacity-70">{curSessData.title}</p>
            )}
          </div>
          {!sidebarOpen && (
            <button onClick={newSession} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-medium hover:bg-[var(--accent)]/10 transition-colors shrink-0" style={{ color: 'var(--accent)' }}>
              <Sparkles size={14} /> New
            </button>
          )}
        </div>

        {/* Messages or Empty State */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-4 custom-scroll">
          {!hasStarted ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 pb-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--accent)' }}>
                  <Brain size={28} color="#fff" />
                </div>
                <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Mariam AI</h2>
                <p className="text-sm opacity-50">Your visual-first medical tutor</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {STARTERS.map((s, i) => (
                  <button key={i} onClick={() => send(s.text)}
                    className="flex items-center gap-3 p-3 rounded-2xl text-sm text-left hover:bg-[var(--accent)]/8 transition-all group"
                    style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
                    <span className="text-xl">{s.icon}</span>
                    <span className="opacity-70 group-hover:opacity-100 leading-snug">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {msgs.map((msg, idx) => {
                const isAsst = msg.role === 'assistant';
                const isEditing = editingMsgIdx === idx;
                return (
                  <div key={idx} className={\`flex gap-2.5 group \${isAsst ? 'items-start' : 'items-end justify-end'}\`}>
                    {isAsst && (
                      <div className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold mt-0.5" style={{ background: 'var(--accent)', color: '#fff' }}>M</div>
                    )}
                    <div className={\`flex flex-col \${isAsst ? 'items-start max-w-[88%]' : 'items-end max-w-[80%]'}\`}>
                      {isEditing ? (
                        <div className="w-full">
                          <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            className="w-full rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none"
                            style={{ background: 'var(--accent)', color: '#fff', minHeight: '80px', border: 'none' }}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit(); } }}
                          />
                          <div className="flex gap-2 mt-1.5 justify-end">
                            <button onClick={() => setEditingMsgIdx(null)} className="px-3 py-1 rounded-xl text-xs opacity-60 hover:opacity-100" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>Cancel</button>
                            <button onClick={submitEdit} className="px-3 py-1 rounded-xl text-xs font-bold" style={{ background: 'var(--accent)', color: '#fff' }}>Send</button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={\`px-4 py-3 rounded-2xl text-sm leading-relaxed \${isAsst ? 'rounded-tl-sm' : 'rounded-br-sm'}\`}
                          style={isAsst
                            ? { background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }
                            : { background: 'var(--accent)', color: '#fff' }
                          }
                        >
                          {isAsst && loading && idx === msgs.length - 1 && !msg.content ? (
                            <div className="space-y-2 py-1">
                              {[100, 78, 55].map((w, i) => (
                                <div key={i} className="h-3 rounded-full" style={{
                                  width: \`\${w}%\`,
                                  background: 'linear-gradient(90deg, rgba(99,102,241,0.08), rgba(99,102,241,0.18), rgba(99,102,241,0.08))',
                                  backgroundSize: '200% 100%',
                                  animation: \`shimmer 1.5s ease-in-out \${i * 0.2}s infinite\`
                                }} />
                              ))}
                            </div>
                          ) : (
                            renderMsgContent(msg.content)
                          )}
                        </div>
                      )}
                      <MsgActions msg={msg} idx={idx} />
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 px-3 pt-2 pb-2" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-end gap-2 rounded-2xl px-3 py-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                const r = Math.min(5, e.target.value.split('\\n').length);
                setInputRows(r);
              }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } }}
              rows={inputRows}
              placeholder="Ask Mariam anything medical…"
              className="flex-1 bg-transparent resize-none focus:outline-none text-sm leading-relaxed"
              style={{ color: 'var(--text)', maxHeight: '120px' }}
            />
            <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
              <button onClick={toggleVoice} className={\`p-2 rounded-xl transition-colors \${listening ? 'bg-red-500/20 text-red-500' : 'opacity-50 hover:opacity-90 hover:bg-[var(--accent)]/10'}\`}>
                <Mic size={17} />
              </button>
              <button onClick={doSend} disabled={loading || !input.trim()} className="p-2 rounded-xl font-bold transition-all disabled:opacity-30" style={{ background: 'var(--accent)', color: '#fff' }}>
                {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

`;

// Replace the broken return block (from retPos to settingsPos) with the new block
const newContent = f.slice(0, retPos) + newReturnBlock + f.slice(settingsPos);

console.log(`Original length: ${f.length}`);
console.log(`New length: ${newContent.length}`);
console.log(`\nVerification — chars around injection point:`);
console.log(JSON.stringify(newContent.slice(retPos, retPos + 100)));

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('\nDone!');
