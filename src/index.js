/* eslint-disable import/prefer-default-export */
import ModuleCalendar from './components/ModuleCalendar';

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

export { ModuleCalendar };

// Presentational dashboard building blocks. Purely visual and module-agnostic, so any
// module can compose a dashboard from them instead of copying the file.
export {
  DashboardHeader,
  StatCard,
  SectionCard,
  EmptyState,
  Breakdown,
  RankedList,
  PipelineFlow,
  Stepper,
} from './components/DashboardKit';

const DEFAULT_CONFIG = {
  refs: [
    { key: 'tasafCommon.ModuleCalendar', ref: ModuleCalendar },
  ],
};

export const TasafCommonModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
