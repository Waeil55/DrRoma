/**
 * MARIAM PRO  SplitPaneExam
 * Desktop split-pane exam view: question on left, lab results / reference on right.
 * Uses the shared SplitPane UI component.
 */
import React from 'react';
import SplitPane from '../ui/SplitPane.jsx';

export default function SplitPaneExam({ questionContent, labContent, children }) {
  return (
    <SplitPane
      left={
        <div className="flex-1 min-h-0 overflow-y-auto p-4 view-scroll">
          {questionContent || children}
        </div>
      }
      right={
        <div className="flex-1 min-h-0 overflow-y-auto p-4 view-scroll" style={{ background: 'var(--surface)' }}>
          {labContent || (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
              <p className="text-sm" style={{ color: 'var(--text2)' }}>No lab results for this question</p>
            </div>
          )}
        </div>
      }
      defaultSplit={55}
    />
  );
}
