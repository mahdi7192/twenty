import { useLingui } from '@lingui/react/macro';
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
} from 'twenty-ui/icon';

export const useNavigationDrawerTogglePresentation = (
  isNavigationDrawerExpanded: boolean,
) => {
  const { t } = useLingui();
  const isRtl =
    typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

  if (isRtl) {
    return isNavigationDrawerExpanded
      ? { label: t`Collapse sidebar`, Icon: IconLayoutSidebarRightCollapse }
      : { label: t`Expand sidebar`, Icon: IconLayoutSidebarRightExpand };
  }

  return isNavigationDrawerExpanded
    ? { label: t`Collapse sidebar`, Icon: IconLayoutSidebarLeftCollapse }
    : { label: t`Expand sidebar`, Icon: IconLayoutSidebarRightCollapse };
};

