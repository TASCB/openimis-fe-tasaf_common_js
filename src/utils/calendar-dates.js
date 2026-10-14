export function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday=0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
export function startOfMonth(date = new Date()) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
export function endOfMonth(date = new Date()) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

const DAY_MS = 86400000;
const dayStart = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};
const dayIndex = (from, d) => Math.round((d - from) / DAY_MS);

export function eventSpan(e) {
  const first = dayStart(e.startDatetime);
  const end = new Date(e.endDatetime || e.startDatetime);
  let last = dayStart(end);
  if (end.getTime() === last.getTime() && last > first) last = addDays(last, -1);
  if (last < first) last = first;
  return { first, last };
}

export function coversDay(e, day) {
  const { first, last } = eventSpan(e);
  const d = dayStart(day);
  return first <= d && d <= last;
}

export function layoutWeek(weekStart, events) {
  const from = dayStart(weekStart);
  const to = addDays(from, 6);
  const segments = [];
  (events || []).forEach((e) => {
    const { first, last } = eventSpan(e);
    if (last < from || first > to) return;
    segments.push({
      event: e,
      start: first < from ? 0 : dayIndex(from, first),
      end: last > to ? 6 : dayIndex(from, last),
      continuesBefore: first < from,
      continuesAfter: last > to,
    });
  });
  segments.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
  const laneEnds = [];
  segments.forEach((s) => {
    let lane = laneEnds.findIndex((end) => end < s.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(s.end);
    } else {
      laneEnds[lane] = s.end;
    }
    s.lane = lane;
  });
  return segments;
}
