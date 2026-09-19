import { styled } from '@linaria/react';
import { useContext, useState } from 'react';
import { Section } from 'twenty-ui/components';
import { IconChevronDown } from 'twenty-ui/icon';
import { AnimatedExpandableContainer } from 'twenty-ui/primitives/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeader = styled.header`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 24px;
  justify-content: space-between;
`;

const StyledTitleLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledChevronWrapper = styled.div<{ isExpanded: boolean }>`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  transform: ${({ isExpanded }) =>
    isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
`;

const STANDARD_FIELD_GROUP_TITLE_MAP: Record<string, string> = {
  General: 'عمومی',
  Work: 'اطلاعات شغلی',
  Social: 'شبکه‌های اجتماعی',
  System: 'سیستم',
  Contact: 'اطلاعات تماس',
  Business: 'کسب‌وکار',
  Deal: 'معامله',
  Relations: 'روابط',
  Details: 'جزئیات',
  Emails: 'ایمیل‌ها',
  Calls: 'تماس‌ها',
  Tasks: 'وظایف',
  Notes: 'یادداشت‌ها',
  Files: 'فایل‌ها',
  Timeline: 'تایم‌لاین',
  Activity: 'فعالیت',
};

type FieldsWidgetGroupContainerProps = {
  children: React.ReactNode;
  title: string;
  defaultExpanded?: boolean;
};

export const FieldsWidgetGroupContainer = ({
  children,
  title,
  defaultExpanded = true,
}: FieldsWidgetGroupContainerProps) => {
  const { theme } = useContext(ThemeContext);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const isRtl =
    typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

  const displayTitle = isRtl
    ? (STANDARD_FIELD_GROUP_TITLE_MAP[title] ?? title)
    : title;

  const handleToggleGroup = () =>
    setIsExpanded((previousIsExpanded) => !previousIsExpanded);

  return (
    <Section.Root>
      <StyledHeader onClick={handleToggleGroup}>
        <StyledTitleLabel>{displayTitle}</StyledTitleLabel>
        <StyledChevronWrapper isExpanded={isExpanded}>
          <IconChevronDown
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        </StyledChevronWrapper>
      </StyledHeader>
      <AnimatedExpandableContainer
        isExpanded={isExpanded}
        initial={false}
        mode="fit-content"
      >
        {children}
      </AnimatedExpandableContainer>
    </Section.Root>
  );
};
