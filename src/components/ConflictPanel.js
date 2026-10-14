import React from 'react';
import {
  Grid, Paper, Typography, Divider, Link,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import BlockIcon from '@material-ui/icons/Block';
import WarningOutlined from '@material-ui/icons/ErrorOutline';

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  section: { padding: theme.spacing(1.5, 2) },
  head: {
    display: 'flex', alignItems: 'center', gap: theme.spacing(1), fontWeight: 600, marginBottom: theme.spacing(0.5),
  },
  hard: { color: theme.palette.error.main },
  soft: { color: theme.palette.warning.dark || theme.palette.warning.main },
  row: {
    display: 'flex', alignItems: 'baseline', gap: theme.spacing(1.5), padding: theme.spacing(0.5, 0, 0.5, 4),
  },
  message: { flex: 1, color: theme.palette.text.primary },
}));

function Section({
  classes, items, title, tone, icon, viewLabel, hrefFor,
}) {
  return (
    <div className={classes.section}>
      <Typography className={`${classes.head} ${classes[tone]}`}>
        {icon}
        {title}
      </Typography>
      {items.map((c, i) => {
        const href = hrefFor ? hrefFor(c) : null;
        return (
          // eslint-disable-next-line react/no-array-index-key
          <div className={classes.row} key={i}>
            <Typography variant="body2" className={classes.message}>{c.message}</Typography>
            {href && (
              <Link href={href} target="_blank" rel="noopener noreferrer" variant="body2">
                {viewLabel}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ConflictPanel({
  conflicts, hardTitle, softTitle, viewLabel, hrefFor,
}) {
  const classes = useStyles();
  const hard = (conflicts || []).filter((c) => c.hard);
  const soft = (conflicts || []).filter((c) => !c.hard);
  if (!hard.length && !soft.length) return null;
  return (
    <Grid item xs={12}>
      <Paper className={classes.paper}>
        {hard.length > 0 && (
          <Section
            classes={classes} items={hard} title={hardTitle} tone="hard"
            icon={<BlockIcon fontSize="small" />} viewLabel={viewLabel} hrefFor={hrefFor}
          />
        )}
        {hard.length > 0 && soft.length > 0 && <Divider />}
        {soft.length > 0 && (
          <Section
            classes={classes} items={soft} title={softTitle} tone="soft"
            icon={<WarningOutlined fontSize="small" />} viewLabel={viewLabel} hrefFor={hrefFor}
          />
        )}
      </Paper>
    </Grid>
  );
}

export default ConflictPanel;
