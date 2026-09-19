import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { type CommandMenuContextApi } from 'twenty-shared/types';
import { interpolateCommandMenuItemFields } from '@/command-menu-item/display/utils/interpolateCommandMenuItemFields';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const checkInShortcuts = (
  commandMenuItem: CommandMenuItemFieldsFragment,
  search: string,
) => {
  const concatenatedString = commandMenuItem.hotKeys?.join('') ?? '';
  const searchNormalized = normalizeSearchText(search.trim());
  return normalizeSearchText(concatenatedString).includes(searchNormalized);
};

const checkInLabels = (
  commandMenuItem: CommandMenuItemFieldsFragment,
  search: string,
  commandMenuContextApi: CommandMenuContextApi,
) => {
  const { label } = interpolateCommandMenuItemFields(
    commandMenuItem,
    commandMenuContextApi,
  );

  if (isNonEmptyString(label)) {
    const searchNormalized = normalizeSearchText(search);
    return (
      normalizeSearchText(label).includes(searchNormalized) ||
      normalizeSearchText(commandMenuItem.label).includes(searchNormalized)
    );
  }
  return false;
};

type UseFilterCommandMenuItemsWithSidePanelSearchProps = {
  sidePanelSearch: string;
  commandMenuContextApi: CommandMenuContextApi;
};

export const useFilterCommandMenuItemsWithSidePanelSearch = ({
  sidePanelSearch,
  commandMenuContextApi,
}: UseFilterCommandMenuItemsWithSidePanelSearchProps) => {
  const filterCommandMenuItemsWithSidePanelSearch = useCallback(
    (commandMenuItems: CommandMenuItemFieldsFragment[]) => {
      return commandMenuItems.filter((commandMenuItem) =>
        sidePanelSearch.length > 0
          ? checkInShortcuts(commandMenuItem, sidePanelSearch) ||
            checkInLabels(
              commandMenuItem,
              sidePanelSearch,
              commandMenuContextApi,
            )
          : true,
      );
    },
    [sidePanelSearch, commandMenuContextApi],
  );

  return {
    filterCommandMenuItemsWithSidePanelSearch,
  };
};
