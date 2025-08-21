import type { SelectItem } from '../../types';

export interface MirthSelectProps {
  value: string;
  items: SelectItem[];
  onChange: (value: string) => void;
  fullWdith?: boolean;
}
