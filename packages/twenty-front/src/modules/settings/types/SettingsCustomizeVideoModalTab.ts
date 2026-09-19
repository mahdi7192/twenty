import { type IconComponent } from 'twenty-ui/icon';

export type SettingsCustomizeVideoModalTab = {
  id: string;
  title: string;
  Icon: IconComponent;
  vimeoId?: string;
  videoUrl?: string;
  hasSound?: boolean;
};
