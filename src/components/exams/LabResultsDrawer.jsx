/**
 * MARIAM PRO  LabResultsDrawer
 * Mobile bottom-sheet drawer for viewing lab results / imaging during an exam.
 */
import React, { useState } from 'react';
import BottomSheet from '../ui/BottomSheet.jsx';
import { FlaskConical } from 'lucide-react';

export default function LabResultsDrawer({ labData, imagingData }) {
  const [open, setOpen] = useState(false);
  const hasContent = !!(labData || imagingData);

  if (!hasContent) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="touch-target flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
        style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}
        aria-label="View lab results"
      >
        <FlaskConical size={16} />
        View Labs
      </button>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Lab Results & Imaging">
        <div className="space-y-4 px-4 pb-6">
          {labData && (
            <div>
              <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--text)' }}>Lab Values</h4>
              <div className="rounded-xl p-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <pre className="text-xs whitespace-pre-wrap" style={{ color: 'var(--text2)' }}>{typeof labData === 'string' ? labData : JSON.stringify(labData, null, 2)}</pre>
              </div>
            </div>
          )}
          {imagingData && (
            <div>
              <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--text)' }}>Imaging</h4>
              <div className="rounded-xl p-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <pre className="text-xs whitespace-pre-wrap" style={{ color: 'var(--text2)' }}>{typeof imagingData === 'string' ? imagingData : JSON.stringify(imagingData, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
