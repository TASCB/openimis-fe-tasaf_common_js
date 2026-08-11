import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '@material-ui/core';

const baseStyle = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/**
 * Truncating table cell with the full value on hover.
 *
 * fe-core's Table exposes no column-width prop, so width belongs with the
 * column definition in itemFormatters rather than in positional nth-child CSS.
 */
export function TruncatedCell({
  children, width, minWidth, align, title,
}) {
  const text = title ?? (typeof children === 'string' ? children : '');
  const style = {
    ...baseStyle,
    ...(width ? { maxWidth: width, width } : {}),
    ...(minWidth ? { minWidth } : {}),
    ...(align ? { textAlign: align } : {}),
  };
  const cell = <div style={style}>{children}</div>;
  return text ? <Tooltip title={text}><span>{cell}</span></Tooltip> : cell;
}

TruncatedCell.propTypes = {
  children: PropTypes.node,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  align: PropTypes.oneOf(['left', 'center', 'right']),
  title: PropTypes.string,
};

TruncatedCell.defaultProps = {
  children: null,
  width: undefined,
  minWidth: undefined,
  align: undefined,
  title: undefined,
};

/** Shorthand for the common case: cell(item.name, 200) */
export const cell = (value, width, align) => (
  <TruncatedCell width={width} align={align} title={value == null ? '' : String(value)}>
    {value}
  </TruncatedCell>
);

/**
 * Styles for a Searcher wrapper: fixes the table layout so one long value
 * cannot stretch a column. Widths themselves come from the cells.
 */
export const fixedTableStyles = {
  '& table': { tableLayout: 'fixed', minWidth: '100%' },
  '& table th': { whiteSpace: 'nowrap' },
};

export default TruncatedCell;
