// The backend stores naive UTC (USE_TZ=False) and sends it without a zone marker, which the
// browser would read as local time. These helpers read it as UTC and give the wall-clock time
// in the display time zone (module config fe-tasaf_common.displayTimeZone).

export const DEFAULT_DISPLAY_TIME_ZONE = 'Africa/Dar_es_Salaam';

const ZONE_MARK = /([zZ]|[+-]\d\d:?\d\d)$/;
let displayTimeZone = DEFAULT_DISPLAY_TIME_ZONE;
let formatter = null;

const isTimeZone = (zone) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone }); // eslint-disable-line no-new
    return true;
  } catch (e) {
    return false;
  }
};

export function setDisplayTimeZone(zone) {
  const next = zone && isTimeZone(zone) ? zone : DEFAULT_DISPLAY_TIME_ZONE;
  if (zone && next !== zone) console.warn(`fe-tasaf_common: unknown displayTimeZone "${zone}", using ${next}`);
  if (next !== displayTimeZone) formatter = null;
  displayTimeZone = next;
}

export const getDisplayTimeZone = () => displayTimeZone;

const parts = (date) => {
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: displayTimeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  return Object.fromEntries(formatter.formatToParts(date).map((p) => [p.type, p.value]));
};

// "2026-11-02T11:06:02" (UTC from the backend) -> "2026-11-02T14:06:02" (EAT), still without a
// zone marker, so fe-core's formatDateTimeFromISO / formatDateFromISO show it unchanged in the
// configured format. Date-only values and unparsable input come back as they are.
export function toDisplayTime(value) {
  if (!value) return value;
  let date = value;
  if (!(value instanceof Date)) {
    const text = String(value).trim().replace(' ', 'T');
    if (!text.includes('T')) return value;
    date = new Date(ZONE_MARK.test(text) ? text : `${text}Z`);
  }
  if (Number.isNaN(date.getTime())) return value;
  const p = parts(date);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;
}

// "2026-11-02 14:06:02" in the display time zone; '' when there is no value.
export const formatDisplayTime = (value) => (value ? String(toDisplayTime(value)).replace(/^(\d{4}-\d\d-\d\d)T/, '$1 ') : '');
