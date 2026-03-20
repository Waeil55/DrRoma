/**
 * MARIAM PRO  File Category Detection & Icons
 * Extracted from App.jsx.
 */

/**
 * Detects the category of a File based on its name and MIME type.
 * @param {{ name: string, type: string }} file
 * @returns {'pdf'|'word'|'spreadsheet'|'csv'|'image'|'text'|'unknown'}
 */
export const getFileCategory = (file) => {
  const n = file.name.toLowerCase();
  const t = file.type || '';
  if (t === 'application/pdf' || n.endsWith('.pdf')) return 'pdf';
  if (t.includes('wordprocessingml') || t.includes('msword') || n.endsWith('.docx') || n.endsWith('.doc')) return 'word';
  if (t.includes('spreadsheetml') || t.includes('ms-excel') || n.endsWith('.xlsx') || n.endsWith('.xls')) return 'spreadsheet';
  if (n.endsWith('.csv') || t === 'text/csv') return 'csv';
  if (t.startsWith('image/')) return 'image';
  const textExts = ['.txt', '.md', '.markdown', '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.go', '.rs', '.rb', '.php', '.html', '.css', '.json', '.yaml', '.yml', '.xml', '.sh', '.bash', '.zsh', '.sql', '.r', '.swift', '.kt', '.dart', '.vue', '.svelte', '.toml', '.ini', '.env', '.log'];
  if (t.startsWith('text/') || textExts.some(e => n.endsWith(e))) return 'text';
  return 'unknown';
};

/**
 * Icon/color mapping for each file category.
 * References Lucide icon names  the consuming component should
 * import the actual icons and replace the string references.
 */
export const FILE_ICON_CONFIG = {
  pdf:         { icon: 'FileText',  from: 'from-red-500',     to: 'to-rose-600',    label: 'PDF' },
  word:        { icon: 'FileText',  from: 'from-blue-500',    to: 'to-blue-700',    label: 'Word' },
  spreadsheet: { icon: 'Table',     from: 'from-emerald-500', to: 'to-green-700',   label: 'Excel' },
  csv:         { icon: 'Table',     from: 'from-teal-500',    to: 'to-emerald-700', label: 'CSV' },
  image:       { icon: 'Image',     from: 'from-purple-500',  to: 'to-violet-700',  label: 'Image' },
  text:        { icon: 'FileCode',  from: 'from-amber-500',   to: 'to-orange-600',  label: 'Text' },
  unknown:     { icon: 'FileUp',    from: 'from-slate-500',   to: 'to-slate-700',   label: 'File' },
};
