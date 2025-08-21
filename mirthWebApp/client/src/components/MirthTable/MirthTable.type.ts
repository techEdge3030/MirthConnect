import type { Cell, Column, Row } from '../../types';

export interface MirthTableProps {
  columns: Column[];
  rows: Row[];
  onCellChange?: (columnId: string, rowId: string, newCell: Cell) => void;
  onRowClick?: (data: Row) => void;
}

export interface MirthTableCellProps {
  data: Cell;
  rowId: string;
  columnId: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  width?: string;
  onCellChange?: (rowId: string, columnId: string, newCell: Cell) => void;
}
