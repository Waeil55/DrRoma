import React from 'react';

const Bone = ({ w = '100%', h = 14, r = 7, mb = 8 }) => (
  <div className="shimmer skeleton-line" style={{ width: w, height: h, borderRadius: r, marginBottom: mb }} />
);

export function FlashcardsSkeleton() {
  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{ background: 'var(--bg)' }}>
      <Bone h={40} r={12} mb={16} />
      <div className="flex gap-3 mb-4">
        <Bone w="30%" h={32} r={16} /><Bone w="30%" h={32} r={16} /><Bone w="30%" h={32} r={16} />
      </div>
      {[1,2,3].map(i => (
        <div key={i} className="shimmer skeleton" style={{ background: 'var(--surface)', padding: 16, borderRadius: 16, marginBottom: 12 }}>
          <Bone w="70%" h={18} /><Bone w="50%" h={14} /><Bone w="40%" h={14} mb={0} />
        </div>
      ))}
    </div>
  );
}

export function ExamsSkeleton() {
  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{ background: 'var(--bg)' }}>
      <Bone h={40} r={12} mb={16} />
      <div className="flex gap-3 mb-4">
        <Bone w="48%" h={36} r={12} /><Bone w="48%" h={36} r={12} />
      </div>
      {[1,2,3,4].map(i => (
        <div key={i} className="shimmer skeleton" style={{ background: 'var(--surface)', padding: 16, borderRadius: 16, marginBottom: 12 }}>
          <Bone w="60%" h={16} /><Bone w="80%" h={14} /><Bone w="30%" h={24} r={12} mb={0} />
        </div>
      ))}
    </div>
  );
}

export function CasesSkeleton() {
  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{ background: 'var(--bg)' }}>
      <Bone h={40} r={12} mb={16} />
      {[1,2,3].map(i => (
        <div key={i} className="shimmer skeleton" style={{ background: 'var(--surface)', padding: 20, borderRadius: 16, marginBottom: 12 }}>
          <Bone w="80%" h={18} /><Bone w="100%" h={14} /><Bone w="60%" h={14} /><Bone w="40%" h={28} r={14} mb={0} />
        </div>
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{ background: 'var(--bg)' }}>
      <Bone h={44} r={12} mb={12} />
      <div className="flex-1 flex flex-col gap-3">
        <div className="self-end" style={{ width: '65%' }}><Bone h={48} r={18} /></div>
        <div className="self-start" style={{ width: '80%' }}><Bone h={72} r={18} /></div>
        <div className="self-end" style={{ width: '55%' }}><Bone h={40} r={18} /></div>
        <div className="self-start" style={{ width: '75%' }}><Bone h={56} r={18} /></div>
      </div>
      <Bone h={48} r={24} mb={0} />
    </div>
  );
}

export function TasksSkeleton() {
  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{ background: 'var(--bg)' }}>
      <Bone h={40} r={12} mb={12} />
      <Bone w="30%" h={20} r={10} mb={8} />
      {[1,2,3].map(i => (
        <div key={i} className="shimmer skeleton" style={{ background: 'var(--surface)', padding: 14, borderRadius: 14, marginBottom: 10 }}>
          <div className="flex items-center gap-3"><Bone w={22} h={22} r={11} mb={0} /><Bone w="70%" h={16} mb={0} /></div>
        </div>
      ))}
      <Bone w="35%" h={20} r={10} mb={8} />
      {[1,2].map(i => (
        <div key={i} className="shimmer skeleton" style={{ background: 'var(--surface)', padding: 14, borderRadius: 14, marginBottom: 10 }}>
          <div className="flex items-center gap-3"><Bone w={22} h={22} r={11} mb={0} /><Bone w="60%" h={16} mb={0} /></div>
        </div>
      ))}
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{ background: 'var(--bg)' }}>
      <div className="flex justify-between items-center mb-2">
        <Bone w="40%" h={28} r={8} mb={0} /><div className="flex gap-2"><Bone w={32} h={32} r={8} mb={0} /><Bone w={32} h={32} r={8} mb={0} /></div>
      </div>
      <div className="flex gap-1 mb-2">{[...Array(7)].map((_,i)=> <Bone key={i} w="14%" h={16} r={4} mb={0} />)}</div>
      {[...Array(5)].map((_,r)=>(
        <div key={r} className="flex gap-1 mb-1">{[...Array(7)].map((_,c)=> <Bone key={c} w="14%" h={40} r={8} mb={0} />)}</div>
      ))}
    </div>
  );
}

export function VoiceTutorSkeleton() {
  return (
    <div className="flex flex-col h-full items-center justify-center gap-6" style={{ background: 'var(--bg)' }}>
      <Bone w={120} h={120} r={60} mb={12} />
      <Bone w="60%" h={20} r={10} />
      <Bone w="80%" h={60} r={16} />
      <div className="flex gap-4 mt-4">
        <Bone w={48} h={48} r={24} mb={0} /><Bone w={48} h={48} r={24} mb={0} /><Bone w={48} h={48} r={24} mb={0} /><Bone w={48} h={48} r={24} mb={0} />
      </div>
    </div>
  );
}

export function PodcastSkeleton() {
  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{ background: 'var(--bg)' }}>
      <div className="flex items-center gap-4 mb-4">
        <Bone w={64} h={64} r={12} mb={0} />
        <div className="flex-1"><Bone w="70%" h={18} /><Bone w="50%" h={14} mb={0} /></div>
      </div>
      <Bone h={4} r={2} mb={8} />
      <div className="flex justify-center gap-6">
        <Bone w={40} h={40} r={20} mb={0} /><Bone w={56} h={56} r={28} mb={0} /><Bone w={40} h={40} r={20} mb={0} />
      </div>
      <Bone w="90%" h={14} r={7} mb={4} /><Bone w="100%" h={14} r={7} mb={4} /><Bone w="70%" h={14} r={7} />
    </div>
  );
}
