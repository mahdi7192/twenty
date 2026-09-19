import React from 'react';

import styles from './MenuItemHotKeys.module.scss';

export type MenuItemHotKeysProps = {
  hotKeys?: string[];
  joinLabel?: string;
};

export const MenuItemHotKeys = ({
  hotKeys,
  joinLabel,
}: MenuItemHotKeysProps) => {
  const isRtl =
    typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  const effectiveJoinLabel = joinLabel ?? (isRtl ? 'سپس' : 'then');
  return (
    <div className={styles.commandText}>
      {hotKeys && (
        <div className={styles.commandTextContainer}>
          {hotKeys.map((hotKey, index) => (
            <React.Fragment key={index}>
              <div className={styles.commandKey}>{hotKey}</div>
              {index < hotKeys.length - 1 && effectiveJoinLabel}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
