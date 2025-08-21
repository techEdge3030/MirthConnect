import { Checkbox, OutlinedInput } from '@mui/material';
import type { ChangeEvent } from 'react';
import { useState } from 'react';

import MirthSelect from '../MirthSelect';
import type { MirthTableCellProps } from './MirthTable.type';
import StyledTableCell from './StyledTableCell';

const MirthTableCell = ({
  data,
  rowId,
  columnId,
  align,
  width,
  onCellChange
}: MirthTableCellProps) => {
  const [editMode, setEditMode] = useState(false);

  const handleCellDBClick = () => {
    if (data.editable) {
      setEditMode(true);
    }
  };

  const handleBlur = () => setEditMode(false);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (onCellChange) {
      onCellChange(rowId, columnId, { ...data, value: event.target.value });
    }
  };

  const handleClick = () => {
    if (data.type === 'checkbox' && onCellChange) {
      onCellChange(rowId, columnId, { ...data, value: !data.value });
    }
  };

  const handleSelectChange = (value: string) => {
    if (onCellChange) {
      onCellChange(rowId, columnId, { ...data, value });
    }
  };

  return (
    <StyledTableCell
      style={{
        padding: 0,
        border: '1px solid black',
        borderCollapse: 'collapse'
      }}
      align={align}
      width={width}
      onClick={handleClick}
      onDoubleClick={handleCellDBClick}
    >
      {(data.type === 'text' || data.type === 'number') &&
        (editMode ? (
          <OutlinedInput
            size="small"
            value={data.value}
            onBlur={handleBlur}
            onChange={handleInputChange}
            autoFocus
            fullWidth
          />
        ) : (
          data.value
        ))}
      {data.type === 'checkbox' && <Checkbox checked={data.value as boolean} />}
      {data.type === 'select' && data.items && (
        <MirthSelect
          value={data.value as string}
          items={data.items}
          onChange={handleSelectChange}
          fullWdith
        />
      )}
    </StyledTableCell>
  );
};

export default MirthTableCell;
