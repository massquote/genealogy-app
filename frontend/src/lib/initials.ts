/**
 * Derive 1–2 uppercase initials from a name.
 * "Felix Q Tester" -> "FT"
 * "Alice Smith"    -> "AS"
 * "Madonna"        -> "M"
 * ""               -> "?"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

/**
 * Pick a deterministic colour for an avatar from a small palette so two
 * users with the same initials still look distinct.
 */
const palette = [
  'bg-brand-600',
  'bg-emerald-600',
  'bg-rose-600',
  'bg-amber-600',
  'bg-violet-600',
  'bg-sky-600',
  'bg-pink-600',
  'bg-teal-600',
] as const;

export function colorForName(name: string | null | undefined): string {
  if (!name) return 'bg-slate-500';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % palette.length;
  return palette[idx]!;
}
