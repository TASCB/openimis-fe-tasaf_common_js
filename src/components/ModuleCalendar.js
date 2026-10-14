import React, {
  useEffect, useState, useMemo,
} from 'react';
import {
  makeStyles, useTheme, alpha, darken,
} from '@material-ui/core/styles';
import {
  Paper, Typography, Button, IconButton, Popover, Box, Fab, TextField, MenuItem, Checkbox,
  ButtonGroup, FormControlLabel, Switch, Table, TableHead, TableBody, TableRow, TableCell,
} from '@material-ui/core';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import ViewWeekIcon from '@material-ui/icons/ViewWeek';
import ViewListIcon from '@material-ui/icons/ViewList';
import AddIcon from '@material-ui/icons/Add';
import EventBusyIcon from '@material-ui/icons/EventBusy';
import {
  useTranslations, useModulesManager, ProgressOrError, withTooltip,
} from '@openimis/fe-core';
import {
  startOfMonth, endOfMonth, startOfWeek, addDays, layoutWeek, coversDay, eventSpan,
} from '../utils/calendar-dates';

const rgba = (color, opacity) => alpha(color, opacity);

const eventTime = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()) || (!d.getHours() && !d.getMinutes())) return '';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const STATUS_TONE = {
  DRAFT: 'planning',
  SUBMITTED: 'planning',
  MANAGER_APPROVED: 'planning',
  OFFICER_APPROVED: 'planning',
  APPROVED: 'confirmed',
  SCHEDULED: 'confirmed',
  ONGOING: 'running',
  COMPLETED: 'finished',
  CLOSED: 'finished',
  ARCHIVED: 'finished',
  REJECTED: 'stopped',
  CANCELLED: 'stopped',
};

const dateParam = (d) => [
  d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0'),
].join('-');

const DOW_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const sameDay = (a, b) => a.toDateString() === b.toDateString();
const VIEWS = ['month', 'week', 'agenda'];

const useStyles = makeStyles((theme) => ({
  root: { paddingTop: theme.spacing(2) },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: theme.spacing(2), marginBottom: theme.spacing(3.5), flexWrap: 'wrap',
  },
  fab: theme.fab,
  title: { fontWeight: 600, lineHeight: 1.15 },
  subtitle: { color: theme.palette.text.secondary, fontSize: 13 },
  card: {
    display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 10,
    minHeight: 'calc(100vh - 285px)',
  },
  toolbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: theme.spacing(1, 1.5), gap: theme.spacing(1), flexWrap: 'wrap',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  navGroup: { display: 'flex', alignItems: 'center', gap: theme.spacing(0.5), marginRight: 'auto' },
  rangeLabel: { fontWeight: 600, marginLeft: theme.spacing(1) },
  toolbarBtn: { height: 32, textTransform: 'none' },
  legend: {
    display: 'flex', flexWrap: 'wrap', gap: theme.spacing(0.75),
    padding: theme.spacing(1, 1.5), borderBottom: `1px solid ${theme.palette.divider}`,
  },
  legendChip: {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px',
    borderRadius: 999, border: `1px solid ${theme.palette.divider}`, cursor: 'pointer',
    fontSize: 12, userSelect: 'none', transition: 'opacity 150ms, background 150ms',
    '&:hover': { background: theme.palette.action.hover },
  },
  legendOff: { opacity: 0.4 },
  legendDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  scopeSwitch: { marginLeft: 'auto', marginRight: 0 },
  statusField: {
    minWidth: 180,
    maxWidth: 280,
    '& .MuiOutlinedInput-root': { height: 32, fontSize: '0.8125rem' },
  },
  gridHead: { display: 'flex', borderBottom: `1px solid ${theme.palette.divider}` },
  dow: {
    flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 11.5, letterSpacing: 0.4,
    textTransform: 'uppercase', color: theme.palette.text.secondary, padding: theme.spacing(0.75, 0),
  },
  dowWeekend: { color: theme.palette.text.disabled },
  body: { flex: 1, display: 'flex', flexDirection: 'column' },
  weekRow: { display: 'flex', flex: 1, minHeight: 104, position: 'relative' },
  bars: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, pointerEvents: 'none',
  },
  bar: {
    position: 'absolute', pointerEvents: 'auto', height: 18,
  },
  barContinuesBefore: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
  barContinuesAfter: { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  cell: {
    flex: 1, minWidth: 0, borderRight: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(0.5),
    display: 'flex', flexDirection: 'column', gap: 2, userSelect: 'none',
    transition: 'background 120ms',
    '&:hover': { background: theme.palette.action.hover },
  },
  cellOther: { background: theme.palette.action.hover },
  cellWeekend: { background: rgba('#607d8b', 0.04) },
  cellToday: { background: rgba(theme.palette.primary.main, 0.06) },
  dayNum: {
    fontSize: 12, color: theme.palette.text.secondary, fontWeight: 500,
    alignSelf: 'flex-start', padding: '1px 2px',
  },
  dayNumOther: { color: theme.palette.text.disabled },
  dayNumToday: {
    background: theme.palette.primary.main, color: theme.palette.primary.contrastText,
    borderRadius: '50%', width: 22, height: 22, lineHeight: '22px', textAlign: 'center', padding: 0,
  },
  event: {
    display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
    borderRadius: 4, padding: '2px 6px', fontSize: 11.5, lineHeight: 1.35,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    transition: 'transform 120ms, box-shadow 120ms',
    '&:hover': { transform: 'translateY(-1px)', boxShadow: theme.shadows[2] },
    '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
  },
  eventCode: { fontWeight: 700, fontVariantNumeric: 'tabular-nums', marginRight: 4 },
  more: {
    fontSize: 11, color: theme.palette.primary.main, cursor: 'pointer', fontWeight: 600,
    padding: '0 4px', alignSelf: 'flex-start', background: 'none', border: 'none', marginTop: 'auto',
  },
  popDay: { padding: theme.spacing(1.5), maxWidth: 320 },
  popTitle: { fontWeight: 600, marginBottom: theme.spacing(1) },
  agenda: { overflowY: 'auto' },
  agendaHead: theme.table.header,
  agendaGroupStart: { '& td': { borderTop: `1px solid ${theme.palette.divider}` } },
  agendaDate: { width: 130, whiteSpace: 'nowrap', fontWeight: 600, verticalAlign: 'top' },
  agendaCode: { color: theme.palette.text.secondary, fontSize: 12 },
  agendaNowrap: { whiteSpace: 'nowrap' },
  empty: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    color: theme.palette.text.secondary, gap: theme.spacing(1.5), padding: theme.spacing(6),
  },
}));

function ModuleCalendar({
  moduleName, events, fetching, error, onFetchRange,
  statusList, onOpenEvent, onCreate, title, subtitle,
  onFetchUnifiedRange, sourceColors, ownSource, unifiedOnly = false,
}) {
  const classes = useStyles();
  const theme = useTheme();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(moduleName, modulesManager);
  const [view, setView] = useState('month');
  const [unified, setUnified] = useState(false);
  const [hiddenSources, setHiddenSources] = useState(() => new Set());
  const unifiedActive = unifiedOnly || unified;
  const [cursor, setCursor] = useState(new Date());
  const [hidden, setHidden] = useState(() => new Set());
  const [dayPop, setDayPop] = useState(null);
  const today = new Date();

  const range = useMemo(() => {
    if (view === 'week') { const from = startOfWeek(cursor); return { from, to: addDays(from, 7) }; }
    if (view === 'agenda') return { from: startOfMonth(cursor), to: endOfMonth(cursor) };
    const from = startOfWeek(startOfMonth(cursor));
    return { from, to: addDays(from, 42) };
  }, [view, cursor]);

  useEffect(() => {
    const fetchRange = unifiedActive && onFetchUnifiedRange ? onFetchUnifiedRange : onFetchRange;
    fetchRange(range.from, range.to);
  }, [unifiedActive, range.from && range.from.getTime(), range.to && range.to.getTime()]);

  const tr = (status) => formatMessage(`status.${status}`);
  const trEvent = (e) => {
    if (e.source) {
      const key = `${e.source.toLowerCase()}.status.${e.status}`;
      const label = formatMessage(key);
      if (label !== key) return label;
    }
    return tr(e.status);
  };
  const toneColors = {
    planning: theme.palette.grey[500],
    confirmed: theme.palette.primary.light || theme.palette.primary.main,
    running: theme.palette.primary.main,
    finished: theme.palette.primary.dark || theme.palette.primary.main,
    stopped: theme.palette.grey[400],
  };
  const color = (status) => toneColors[STATUS_TONE[status]] || theme.palette.grey[500];
  const isStopped = (e) => STATUS_TONE[e.status] === 'stopped';
  const eventColor = (e) => (unifiedActive && e.source && sourceColors
    ? sourceColors[e.source] || '#9e9e9e'
    : color(e.status));

  const visibleEvents = useMemo(
    () => (events || []).filter((e) => !hidden.has(e.status) && !hiddenSources.has(e.source)),
    [events, hidden, hiddenSources],
  );

  const move = (dir) => {
    const d = new Date(cursor);
    if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCursor(d);
  };

  const rangeLabel = view === 'week'
    ? `${startOfWeek(cursor).toLocaleDateString()} – ${addDays(startOfWeek(cursor), 6).toLocaleDateString()}`
    : cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const toggleSource = (src) => setHiddenSources((prev) => {
    const next = new Set(prev);
    if (next.has(src)) next.delete(src); else next.add(src);
    return next;
  });

  const spanLabel = (e) => {
    const { first, last } = eventSpan(e);
    if (sameDay(first, last)) return '';
    const fmt = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    return `${fmt(first)} – ${fmt(last)}`;
  };
  const eventsOnDay = (day) => visibleEvents.filter((e) => coversDay(e, day));

  const renderEvent = (e, dense = true, extraClass = '', extraStyle = {}) => (
    <button
      type="button"
      key={e.id}
      className={`${classes.event} ${extraClass}`}
      style={{
        background: rgba(eventColor(e), 0.14),
        color: darken(eventColor(e), 0.35),
        ...(isStopped(e) ? { textDecoration: 'line-through' } : {}),
        ...extraStyle,
      }}
      title={`${e.code} · ${e.title} — ${trEvent(e)}`}
      onClick={() => onOpenEvent(e)}
      aria-label={`${e.code} ${e.title}, ${trEvent(e)}`}
    >
      {dense ? e.title : <span>{e.title} · <em>{trEvent(e)}</em></span>}
    </button>
  );

  const DAY_NUM_HEIGHT = 24;
  const LANE_HEIGHT = 20;

  const renderCell = (day, inMonth, hiddenCount) => {
    const isToday = sameDay(day, today);
    const isWeekend = [0, 6].includes(day.getDay());
    const cls = [classes.cell];
    if (!inMonth) cls.push(classes.cellOther);
    else if (isToday) cls.push(classes.cellToday);
    else if (isWeekend) cls.push(classes.cellWeekend);
    return (
      <div
        className={cls.join(' ')}
        key={day.toISOString()}
        {...(onCreate ? {
          role: 'button',
          tabIndex: -1,
          title: formatMessage('calendar.new'),
          onClick: () => onCreate(dateParam(day)),
          onKeyDown: (ev) => { if (ev.key === 'Enter') onCreate(dateParam(day)); },
          style: { cursor: 'pointer' },
        } : {})}
      >
        <span
          className={[classes.dayNum, isToday ? classes.dayNumToday : '', !inMonth ? classes.dayNumOther : ''].join(' ')}
          {...(isToday ? { 'aria-current': 'date' } : {})}
        >
          {day.getDate()}
        </span>
        {hiddenCount > 0 && (
          <button
            type="button"
            className={classes.more}
            onClick={(ev) => {
              ev.stopPropagation();
              setDayPop({ anchorEl: ev.currentTarget, day, events: eventsOnDay(day) });
            }}
          >
            {formatMessageWithValues('calendar.more', { count: hiddenCount })}
          </button>
        )}
      </div>
    );
  };

  const renderWeek = (days, inMonth, maxLanes, minHeight) => {
    const segments = layoutWeek(days[0], visibleEvents);
    const hidden = days.map((_, i) => segments.filter((g) => g.lane >= maxLanes && g.start <= i && i <= g.end).length);
    const lanes = segments.reduce((n, g) => Math.max(n, g.lane + 1), 0);
    const height = Math.max(minHeight, DAY_NUM_HEIGHT + Math.min(lanes, maxLanes) * LANE_HEIGHT + (hidden.some(Boolean) ? 18 : 6));
    return (
      <div className={classes.weekRow} key={days[0].toISOString()} style={{ minHeight: height }}>
        {days.map((day, i) => renderCell(day, inMonth(day), hidden[i]))}
        <div className={classes.bars}>
          {segments.filter((g) => g.lane < maxLanes).map((g) => renderEvent(
            g.event,
            true,
            `${classes.bar} ${g.continuesBefore ? classes.barContinuesBefore : ''} ${g.continuesAfter ? classes.barContinuesAfter : ''}`,
            {
              left: `calc(${(g.start * 100) / 7}% + 3px)`,
              width: `calc(${((g.end - g.start + 1) * 100) / 7}% - 6px)`,
              top: DAY_NUM_HEIGHT + g.lane * LANE_HEIGHT,
            },
          ))}
        </div>
      </div>
    );
  };

  const monthWeeks = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(range.from, w * 7 + d)));
  const weekDays = Array.from({ length: 7 }, (_, d) => addDays(startOfWeek(cursor), d));

  const agendaGroups = useMemo(() => {
    const sorted = [...visibleEvents].sort((a, b) => new Date(a.startDatetime) - new Date(b.startDatetime));
    const groups = [];
    sorted.forEach((e) => {
      const key = new Date(e.startDatetime).toDateString();
      let g = groups.find((x) => x.key === key);
      if (!g) { g = { key, day: new Date(e.startDatetime), items: [] }; groups.push(g); }
      g.items.push(e);
    });
    return groups;
  }, [visibleEvents]);

  const isEmpty = !fetching && !error && visibleEvents.length === 0;
  const periodStart = view === 'week' ? startOfWeek(cursor) : startOfMonth(cursor);
  const periodEnd = view === 'week' ? addDays(periodStart, 6) : endOfMonth(cursor);
  const periodCount = visibleEvents.filter((e) => {
    const { first, last } = eventSpan(e);
    return first <= periodEnd && last >= periodStart;
  }).length;

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div>
          <Typography variant="h5" className={classes.title}>{title}</Typography>
          {subtitle && <div className={classes.subtitle}>{subtitle}</div>}
        </div>
      </div>

      {onCreate && withTooltip(
        <div className={classes.fab}><Fab color="primary" onClick={() => onCreate()}><AddIcon /></Fab></div>,
        formatMessage('createButton.tooltip'),
      )}

      <Paper className={classes.card}>
        <div className={classes.toolbar}>
          <div className={classes.navGroup}>
            <Button size="small" color="primary" className={classes.toolbarBtn} onClick={() => setCursor(new Date())}>
              {formatMessage('calendar.today')}
            </Button>
            <IconButton size="small" onClick={() => move(-1)} aria-label={formatMessage('calendar.prev')}><ChevronLeft /></IconButton>
            <IconButton size="small" onClick={() => move(1)} aria-label={formatMessage('calendar.next')}><ChevronRight /></IconButton>
            <Typography variant="subtitle1" className={classes.rangeLabel}>{rangeLabel}</Typography>
            {!fetching && !error && (
              <Typography variant="body2" className={classes.subtitle}>
                {'· '}
                {formatMessageWithValues('calendar.count', { count: periodCount })}
              </Typography>
            )}
          </div>
          {onFetchUnifiedRange && !unifiedOnly && (
            <FormControlLabel
              className={classes.scopeSwitch}
              control={<Switch color="primary" checked={unified} onChange={() => setUnified((u) => !u)} />}
              label={formatMessage('calendar.otherModules')}
            />
          )}
          <TextField
            select
            size="small"
            variant="outlined"
            className={classes.statusField}
            value={statusList.filter((st) => !hidden.has(st))}
            onChange={(ev) => {
              const shown = new Set(ev.target.value);
              setHidden(new Set(statusList.filter((st) => !shown.has(st))));
            }}
            SelectProps={{
              multiple: true,
              inputProps: { 'aria-label': formatMessage('calendar.status') },
              renderValue: (selected) => (selected.length === statusList.length
                ? formatMessage('calendar.allStatuses')
                : selected.map(tr).join(', ')),
            }}
          >
            {statusList.map((st) => (
              <MenuItem key={st} value={st} dense>
                <Checkbox size="small" color="primary" checked={!hidden.has(st)} />
                <span className={classes.legendDot} style={{ background: color(st), marginRight: 8 }} />
                {tr(st)}
              </MenuItem>
            ))}
          </TextField>
          <ButtonGroup size="small" color="primary">
            {VIEWS.map((v) => (
              <Button
                key={v}
                variant={view === v ? 'contained' : 'outlined'}
                className={classes.toolbarBtn}
                startIcon={v === 'month' ? <ViewModuleIcon /> : v === 'week' ? <ViewWeekIcon /> : <ViewListIcon />}
                onClick={() => setView(v)}
              >
                {formatMessage(`calendar.${v}`)}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        {unifiedActive && sourceColors && (
          <div className={classes.legend} role="group" aria-label={formatMessage('calendar.sourceLegend')}>
            {Object.keys(sourceColors).map((src) => (
              <span
                key={src}
                className={`${classes.legendChip} ${hiddenSources.has(src) ? classes.legendOff : ''}`}
                onClick={() => toggleSource(src)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSource(src); }}
              >
                <span className={classes.legendDot} style={{ background: sourceColors[src] }} />
                {formatMessage(`calendar.source.${src}`)}
                {src === ownSource ? ` (${formatMessage('calendar.scope.module')})` : ''}
              </span>
            ))}
          </div>
        )}

        <ProgressOrError progress={fetching} error={error} />

        {!error && !fetching && (
          isEmpty ? (
            <div className={classes.empty}>
              <EventBusyIcon style={{ fontSize: 56, opacity: 0.5 }} />
              <Typography>{formatMessageWithValues('calendar.empty', { range: rangeLabel })}</Typography>
            </div>
          ) : view === 'agenda' ? (
            <div className={classes.agenda}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.agendaHead}>{formatMessage('calendar.col.date')}</TableCell>
                    <TableCell className={classes.agendaHead}>{formatMessage('calendar.col.activity')}</TableCell>
                    {unifiedActive && <TableCell className={classes.agendaHead}>{formatMessage('calendar.col.module')}</TableCell>}
                    <TableCell className={classes.agendaHead}>{formatMessage('calendar.col.when')}</TableCell>
                    <TableCell className={classes.agendaHead}>{formatMessage('calendar.status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agendaGroups.map((g) => g.items.map((e, i) => (
                    <TableRow
                      hover
                      key={e.id}
                      className={i === 0 ? classes.agendaGroupStart : undefined}
                      onClick={() => onOpenEvent(e)}
                      onKeyDown={(ev) => { if (ev.key === 'Enter') onOpenEvent(e); }}
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell className={classes.agendaDate}>
                        {i === 0 ? g.day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : ''}
                      </TableCell>
                      <TableCell>
                        <div>{e.title}</div>
                        <div className={classes.agendaCode}>{e.code}</div>
                      </TableCell>
                      {unifiedActive && (
                        <TableCell className={classes.agendaNowrap}>
                          <span className={classes.legendDot} style={{ background: (sourceColors || {})[e.source] || theme.palette.grey[500], marginRight: 8 }} />
                          {formatMessage(`calendar.source.${e.source}`)}
                        </TableCell>
                      )}
                      <TableCell className={classes.agendaNowrap}>{spanLabel(e) || eventTime(e.startDatetime)}</TableCell>
                      <TableCell className={classes.agendaNowrap}>
                        <span className={classes.legendDot} style={{ background: color(e.status), marginRight: 8 }} />
                        {trEvent(e)}
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className={classes.body}>
              <div className={classes.gridHead}>
                {DOW_KEYS.map((k, i) => (
                  <div key={k} className={`${classes.dow} ${[5, 6].includes(i) ? classes.dowWeekend : ''}`}>
                    {formatMessage(`calendar.dow.${k}`)}
                  </div>
                ))}
              </div>
              {view === 'month'
                ? monthWeeks.map((wk) => renderWeek(wk, (day) => day.getMonth() === cursor.getMonth(), 3, 104))
                : renderWeek(weekDays, () => true, 99, 320)}
            </div>
          )
        )}
      </Paper>

      <Popover
        open={Boolean(dayPop)}
        anchorEl={dayPop && dayPop.anchorEl}
        onClose={() => setDayPop(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {dayPop && (
          <Box className={classes.popDay}>
            <Typography className={classes.popTitle}>
              {dayPop.day.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {dayPop.events.map((e) => renderEvent(e, false))}
            </div>
          </Box>
        )}
      </Popover>
    </div>
  );
}

export default ModuleCalendar;
