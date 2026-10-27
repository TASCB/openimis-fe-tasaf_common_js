import { makeStyles } from '@material-ui/core/styles';

// Tab bar in the openIMIS table-title strip: tabs as wide as their labels, scrolling only when they
// truly do not fit. '&&' outranks MUI's own `min-width: 160px`, which otherwise wins in production
// builds where the stylesheets load in a different order than in the dev server.
const useTabStyles = makeStyles(() => ({
  tabs: {
    display: 'flex', alignItems: 'center', flexWrap: 'nowrap', overflowX: 'auto',
  },
  selectedTab: { borderBottom: '4px solid white', '&&': { minWidth: 'auto' } },
  unselectedTab: { borderBottom: '4px solid transparent', '&&': { minWidth: 'auto' } },
}));

export default useTabStyles;
