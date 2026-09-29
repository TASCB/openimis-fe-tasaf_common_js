import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  Dialog, DialogContent, DialogActions, IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import CloseIcon from '@material-ui/icons/Close';

export const BORDER = '#e2e8e3';
export const MUTED = '#5c6e64';
export const INK = '#152219';
export const PANEL = '#f6f9f7';
// Every status badge is one neutral grey (openIMIS convention).
export const STATUS_CHIP_COLOR = '#9e9e9e';

export const usePreviewStyles = makeStyles((theme) => {
  const teal = theme.palette.primary.main;
  return {
    paper: { borderRadius: 14, overflow: 'hidden' },
    titleBar: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px 14px 24px', borderBottom: `1px solid ${BORDER}`, background: '#eef5f2',
    },
    titleText: { fontSize: 13, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: teal },
    content: { padding: 0, '&:first-child': { paddingTop: 0 } },
    layout: {
      display: 'flex', minHeight: 320,
      [theme.breakpoints.down('sm')]: { flexDirection: 'column' },
    },
    aside: {
      flex: '0 0 34%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10,
      padding: '24px 20px', background: PANEL, borderRight: `1px solid ${BORDER}`,
      [theme.breakpoints.down('sm')]: { borderRight: 0, borderBottom: `1px solid ${BORDER}` },
    },
    main: { flex: 1, minWidth: 0, padding: '22px 24px' },

    heading: { margin: 0, fontSize: 19, fontWeight: 800, lineHeight: 1.25, color: INK, wordBreak: 'break-word' },
    code: { fontSize: 12.5, color: MUTED, fontWeight: 700, letterSpacing: 0.5 },
    tags: { display: 'flex', flexWrap: 'wrap', gap: 6 },
    tag: {
      borderRadius: 999, padding: '2px 10px', fontSize: 11.5, fontWeight: 800,
      color: teal, border: `1px solid ${teal}`,
    },
    statusTag: {
      borderRadius: 999, padding: '2px 10px', fontSize: 11.5, fontWeight: 800,
      color: '#fff', background: STATUS_CHIP_COLOR,
    },

    label: {
      fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: MUTED, marginBottom: 4,
    },
    value: { fontSize: 14.5, color: INK, wordBreak: 'break-word' },
    sub: { fontSize: 12.5, color: MUTED, marginTop: 2 },
    empty: { color: '#9aa8a0' },
    grid: {
      display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px 24px',
      [theme.breakpoints.down('xs')]: { gridTemplateColumns: '1fr' },
    },
    section: { '& + &': { marginTop: 22 } },
    text: {
      fontSize: 14.5, lineHeight: 1.65, color: INK, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    },
    clamped: {
      overflow: 'hidden',
      maskImage: 'linear-gradient(#000 70%, transparent)',
      WebkitMaskImage: 'linear-gradient(#000 70%, transparent)',
    },
    moreBtn: {
      background: 'none', border: 0, color: teal, fontWeight: 700, fontSize: 13, cursor: 'pointer',
      padding: 0, marginTop: 8, fontFamily: 'inherit',
      '&:hover': { textDecoration: 'underline' },
      '&:focus-visible': { outline: 'none', boxShadow: `0 0 0 3px ${teal}40`, borderRadius: 4 },
    },
    scrollBody: {
      maxHeight: 200, overflowY: 'auto', paddingRight: 6,
      fontSize: 14.5, lineHeight: 1.65, color: INK, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    },

    actions: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      padding: '12px 24px', borderTop: `1px solid ${BORDER}`, background: '#fafcfb',
    },
    meta: { fontSize: 12.5, color: MUTED, display: 'flex', flexWrap: 'wrap', gap: '4px 14px' },
    buttons: { display: 'flex', gap: 8, flexShrink: 0 },
  };
});

export function PreviewField({ label, value, sub }) {
  const classes = usePreviewStyles();
  return (
    <div>
      <div className={classes.label}>{label}</div>
      <div className={`${classes.value} ${value || value === 0 ? '' : classes.empty}`}>
        {value || value === 0 ? value : '—'}
      </div>
      {sub && <div className={classes.sub}>{sub}</div>}
    </div>
  );
}

export function PreviewSection({ label, children }) {
  const classes = usePreviewStyles();
  return (
    <div className={classes.section}>
      <div className={classes.label} style={{ marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

// Long text collapsed to a few lines with Read more / Read less, as on the Communication Feed.
// The toggle appears only when the text is actually taller than the collapsed height.
export function PreviewText({
  children, moreLabel, lessLabel, className = '', collapsedHeight = 132,
}) {
  const classes = usePreviewStyles();
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    setExpanded(false);
    if (ref.current) setOverflows(ref.current.scrollHeight > collapsedHeight + 4);
  }, [children, collapsedHeight]);

  const clamp = overflows && !expanded;
  return (
    <>
      <div
        ref={ref}
        className={`${classes.text} ${clamp ? classes.clamped : ''} ${className}`}
        style={clamp ? { maxHeight: collapsedHeight } : undefined}
      >
        {children}
      </div>
      {overflows && (
        <button type="button" className={classes.moreBtn} onClick={() => setExpanded((v) => !v)}>
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </>
  );
}

// Landscape preview: tinted title bar, identity/facts aside on the left, detail on the right,
// meta and actions in the footer. Stacks on narrow screens.
export default function PreviewDialog({
  open, onClose, title, closeLabel, aside, children, meta, actions,
}) {
  const classes = usePreviewStyles();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth classes={{ paper: classes.paper }}>
      <div className={classes.titleBar}>
        <span className={classes.titleText}>{title}</span>
        <IconButton size="small" onClick={onClose} aria-label={closeLabel}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>
      <DialogContent className={classes.content}>
        <div className={classes.layout}>
          {aside && <div className={classes.aside}>{aside}</div>}
          <div className={classes.main}>{children}</div>
        </div>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <div className={classes.meta}>{meta}</div>
        <div className={classes.buttons}>{actions}</div>
      </DialogActions>
    </Dialog>
  );
}
