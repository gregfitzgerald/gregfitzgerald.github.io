// ─── TIME UTILS ───────────────────────────────────────────────────────────────

export function toMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function toTime(min) {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function dur(b) {
  let d = toMin(b.e) - toMin(b.s);
  if (d < 0) d += 1440;
  return d;
}

// Convert "HH:MM" (24h) to "h:MMam/pm" for display
export function fmtTime(t) {
  const [h, m] = t.split(':').map(Number);
  const suffix = h < 12 ? 'am' : 'pm';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')}${suffix}`;
}

export function fmtDur(m) {
  if (m <= 0) return '0m';
  return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? m % 60 + 'm' : ''}` : `${m}m`;
}
