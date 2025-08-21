import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

import type { Cell } from '../../types';
import type { MirthTableProps } from './MirthTable.type';
import MirthTableCell from './MirthTableCell';
import StyledTableCell from './StyledTableCell';
import StyledTableRow from './StyledTableRow';

const MirthTable = ({
  columns,
  rows,
  onCellChange,
  onRowClick
}: MirthTableProps) => {
  return (
    <TableContainer component="div">
      <Table>
        <TableHead>
          <TableRow style={{ border: '1px solid black' }}>
            {columns.map(col => (
              <StyledTableCell key={col.id} align="center" width={col.width}>
                {col.title}
              </StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <StyledTableRow
              key={row.id}
              onClick={() => (onRowClick ? onRowClick(row) : {})}
            >
              {columns.map(col => (
                <MirthTableCell
                  key={row.id + col.id}
                  rowId={row.id}
                  columnId={col.id}
                  align={col.align}
                  width={col.width}
                  data={row[col.id] as Cell}
                  onCellChange={onCellChange}
                />
              ))}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MirthTable;
