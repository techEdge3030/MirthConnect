import type { SelectItem } from './common.type';

export interface Column {
  id: string;
  title: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  width?: string;
}

export interface Cell {
  type: 'text' | 'number' | 'select' | 'checkbox';
  value: string | number | boolean;
  editable?: boolean;
  items?: SelectItem[];
}

export interface Row {
  [key: string]: Cell | string | boolean | undefined | Cell[];
  id: string;
  expendable?: boolean;
  checkbox?: boolean;
  subData?: Cell[];
}
