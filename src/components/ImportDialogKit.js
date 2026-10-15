import React, { useRef, useState } from 'react';
import {
  Dialog, DialogActions, DialogContent, Divider, FormControlLabel, IconButton, Paper, Radio, RadioGroup, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import CloudUploadOutlined from '@material-ui/icons/CloudUploadOutlined';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import InsertDriveFileOutlined from '@material-ui/icons/InsertDriveFileOutlined';

const useStyles = makeStyles((theme) => ({
  head: {
    ...theme.table.title, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing(1),
  },
  step: { color: theme.palette.text.secondary },
  content: { display: 'flex', flexDirection: 'column', gap: theme.spacing(2), paddingTop: theme.spacing(2) },
  actions: { padding: theme.spacing(1.5, 3) },
  hint: {
    display: 'flex', alignItems: 'center', gap: theme.spacing(0.75), marginRight: 'auto', color: theme.palette.text.secondary,
  },
  drop: {
    border: `1px dashed ${theme.palette.divider}`, borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2.5, 2), textAlign: 'center', cursor: 'pointer',
    '&:hover': { borderColor: theme.palette.primary.main, backgroundColor: theme.palette.action.hover },
    '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}` },
  },
  dropOver: { borderColor: theme.palette.primary.main, backgroundColor: theme.palette.action.hover },
  browse: { color: theme.palette.primary.main, textDecoration: 'underline' },
  file: { display: 'flex', alignItems: 'center', gap: theme.spacing(1.5), padding: theme.spacing(1.25, 1.5) },
  fileBad: { borderColor: theme.palette.error.main },
  grow: { flex: 1, minWidth: 0 },
  fileName: { wordBreak: 'break-all' },
  bad: { color: theme.palette.error.main },
  muted: { color: theme.palette.text.secondary },
  choiceLabel: { alignItems: 'flex-start', marginBottom: theme.spacing(0.5) },
  choiceRadio: { paddingTop: theme.spacing(0.5) },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: theme.spacing(1.5) },
  stat: { padding: theme.spacing(1.25, 1.5) },
}));

export function ImportDialog({
  open = true, title, step, onClose, busy, closeLabel, hint, actions, children,
}) {
  const classes = useStyles();
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <div className={classes.head}>
        <div>
          <Typography>{title}</Typography>
          {step && <Typography variant="caption" className={classes.step}>{step}</Typography>}
        </div>
        <IconButton size="small" onClick={onClose} disabled={busy} aria-label={closeLabel}>
          <CloseIcon />
        </IconButton>
      </div>
      <Divider />
      <DialogContent className={classes.content}>{children}</DialogContent>
      <Divider />
      <DialogActions className={classes.actions}>
        <Typography variant="body2" component="span" className={classes.hint}>
          {hint && (
            <>
              <InfoOutlined fontSize="small" />
              {hint}
            </>
          )}
        </Typography>
        {actions}
      </DialogActions>
    </Dialog>
  );
}

export function FileDrop({
  file, meta, bad, dropText, browseText, removeLabel, accept = '.csv', onPick, onRemove,
}) {
  const classes = useStyles();
  const input = useRef(null);
  const [over, setOver] = useState(false);
  const pick = (f) => f && onPick(f);
  if (file) {
    return (
      <Paper variant="outlined" className={`${classes.file} ${bad ? classes.fileBad : ''}`}>
        {bad ? <ErrorOutline className={classes.bad} /> : <InsertDriveFileOutlined color="primary" />}
        <div className={classes.grow}>
          <Typography variant="body2" className={classes.fileName}>{file.name}</Typography>
          <Typography variant="caption" className={bad ? classes.bad : classes.muted}>{meta}</Typography>
        </div>
        <IconButton size="small" onClick={onRemove} aria-label={removeLabel}><DeleteOutline /></IconButton>
      </Paper>
    );
  }
  return (
    <div
      role="button"
      tabIndex={0}
      className={`${classes.drop} ${over ? classes.dropOver : ''}`}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.current?.click(); } }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); }}
    >
      <CloudUploadOutlined color="primary" />
      <Typography variant="body2">
        {dropText}
        {' '}
        <span className={classes.browse}>{browseText}</span>
      </Typography>
      <input ref={input} type="file" accept={accept} hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}

export function ChoiceList({ value, onChange, options }) {
  const classes = useStyles();
  return (
    <RadioGroup value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <FormControlLabel
          key={o.value}
          value={o.value}
          className={classes.choiceLabel}
          control={<Radio color="primary" className={classes.choiceRadio} />}
          label={(
            <>
              <Typography variant="body2">{o.title}</Typography>
              {o.sub && <Typography variant="caption" className={classes.muted}>{o.sub}</Typography>}
            </>
          )}
        />
      ))}
    </RadioGroup>
  );
}

export function StatRow({ stats }) {
  const classes = useStyles();
  return (
    <div className={classes.stats}>
      {stats.map(({ label, value }) => (
        <Paper key={label} variant="outlined" className={classes.stat}>
          <Typography variant="h6">{value}</Typography>
          <Typography variant="caption" className={classes.muted}>{label}</Typography>
        </Paper>
      ))}
    </div>
  );
}
