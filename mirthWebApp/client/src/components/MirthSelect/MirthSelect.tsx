import type { SelectChangeEvent } from '@mui/material';
import { MenuItem, Select } from '@mui/material';

import type { MirthSelectProps } from './MirthSelect.type';

const MirthSelect = ({
  value,
  items,
  onChange,
  fullWdith
}: MirthSelectProps) => {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  return (
    <Select
      size="small"
      value={value}
      onChange={handleChange}
      fullWidth={fullWdith}
    >
      {items.map(item => (
        <MenuItem key={item.value} value={item.value}>
          {item.label}
        </MenuItem>
      ))}
    </Select>
  );
};

export default MirthSelect;
