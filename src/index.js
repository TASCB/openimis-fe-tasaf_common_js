/* eslint-disable import/prefer-default-export */
import ModuleCalendar from './components/ModuleCalendar';
import TruncatedCell, { cell, fixedTableStyles } from './components/TableCell';

export {
  BRAND_TEAL,
  BRAND_TINT,
  ORGANISATION_LINES,
  brandedTableTheme,
  createProtectedPdf,
  loadImageAsset,
  loadTasafLogo,
  loadGovernmentLogo,
  drawHeader,
  addWatermark,
  addFooter,
  drawMetadataBoxes,
} from './pdf/branded';

export { ModuleCalendar, TruncatedCell, cell, fixedTableStyles };

const DEFAULT_CONFIG = {
  refs: [
    { key: 'tasafCommon.ModuleCalendar', ref: ModuleCalendar },
  ],
};

export const TasafCommonModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
