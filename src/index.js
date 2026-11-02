/* eslint-disable import/prefer-default-export */
import ModuleCalendar from './components/ModuleCalendar';
import { setDisplayTimeZone } from './utils/display-time';

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
export {
  DEFAULT_DISPLAY_TIME_ZONE,
  formatDisplayTime,
  getDisplayTimeZone,
  setDisplayTimeZone,
  toDisplayTime,
} from './utils/display-time';
export { default as ConflictPanel } from './components/ConflictPanel';
export { default as UploadBar, formatFileSize } from './components/UploadBar';
export {
  ImportDialog, FileDrop, ChoiceList, StatRow,
} from './components/ImportDialogKit';

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

export { default as useTabStyles } from './components/TabStyles';

// Landscape quick-look dialog frame shared by every module's list previews.
export {
  default as PreviewDialog,
  PreviewField,
  PreviewSection,
  PreviewText,
  usePreviewStyles,
  BORDER as PREVIEW_BORDER,
  MUTED as PREVIEW_MUTED,
  INK as PREVIEW_INK,
  PANEL as PREVIEW_PANEL,
} from './components/PreviewDialog';

const DEFAULT_CONFIG = {
  refs: [
    { key: 'tasafCommon.ModuleCalendar', ref: ModuleCalendar },
  ],
};

export const TasafCommonModule = (cfg) => {
  setDisplayTimeZone(cfg?.displayTimeZone);
  return { ...DEFAULT_CONFIG, ...cfg };
};
