/**
 * MARIAM PRO — FileCover
 * Gradient cover for file cards with category icon.
 */
import React from 'react';
import { FileText, Table, Image, FileCode, FileUp } from 'lucide-react';
import { FILE_ICON_CONFIG } from '../../utils/fileCategory';

const ICON_MAP = { FileText, Table, Image, FileCode, FileUp };

export default function FileCover({ category, className = 'h-28 lg:h-32', name = '' }) {
  const cfg = FILE_ICON_CONFIG[category] || FILE_ICON_CONFIG.unknown;
  const Icon = ICON_MAP[cfg.icon] || FileUp;
  return (
    <div className={`bg-gradient-to-br ${cfg.from} ${cfg.to} flex flex-col items-center justify-center gap-2 ${className}`}>
      <Icon size={36} className="text-white opacity-60" />
      <span className="text-white text-xs font-black uppercase tracking-widest opacity-70 px-2 py-0.5 bg-black/20 rounded-full">{cfg.label}</span>
    </div>
  );
}
