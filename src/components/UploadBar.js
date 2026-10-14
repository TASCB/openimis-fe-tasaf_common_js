import React, { useRef } from 'react';
import {
  Grid, Typography, Divider, Chip, Button, CircularProgress, TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import CloudUploadIcon from '@material-ui/icons/CloudUploadOutlined';

const useStyles = makeStyles((theme) => ({
  form: { padding: theme.spacing(1, 0) },
  item: theme.paper.item,
  formTitle: { color: theme.palette.primary.main, fontWeight: 500 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: theme.spacing(1) },
  chipFailed: { borderColor: theme.palette.error.main, color: theme.palette.error.main },
  label: { color: theme.palette.primary.main },
}));

export function formatFileSize(n) {
  if (!n && n !== 0) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadBar({
  title, chooseLabel, uploadLabel, descriptionLabel, files, failed = [], multiple = true, busy, canUpload = true,
  description, onDescriptionChange, onAddFiles, onRemoveFile, onUpload, children,
}) {
  const classes = useStyles();
  const inputRef = useRef(null);
  return (
    <>
      <Grid container className={classes.form} alignItems="flex-end">
        <Grid item xs={12} className={classes.item}>
          <Typography className={classes.formTitle}>{title}</Typography>
        </Grid>
        {children}
        <Grid item className={classes.item}>
          <input
            ref={inputRef} type="file" multiple={multiple} hidden
            onChange={(e) => { onAddFiles(Array.from(e.target.files || [])); e.target.value = ''; }}
          />
          <Button variant="outlined" color="primary" startIcon={<AttachFileIcon />} onClick={() => inputRef.current?.click()}>
            {chooseLabel}
          </Button>
        </Grid>
        <Grid item xs className={classes.item}>
          <TextField
            fullWidth label={descriptionLabel} value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            InputLabelProps={{ className: classes.label }}
          />
        </Grid>
        <Grid item className={classes.item}>
          <Button
            variant="contained" color="primary" onClick={onUpload} disabled={!files.length || !canUpload || busy}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
          >
            {uploadLabel}
          </Button>
        </Grid>
        {files.length > 0 && (
          <Grid item xs={12} className={classes.item}>
            <div className={classes.chips}>
              {files.map((f, i) => (
                <Chip
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${f.name}-${i}`}
                  variant="outlined"
                  className={failed.includes(f) ? classes.chipFailed : undefined}
                  label={`${f.name} · ${formatFileSize(f.size)}`}
                  onDelete={busy ? undefined : () => onRemoveFile(i)}
                />
              ))}
            </div>
          </Grid>
        )}
      </Grid>
      <Divider />
    </>
  );
}

export default UploadBar;
