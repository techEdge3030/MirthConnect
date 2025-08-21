import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import { IconButton } from '@mui/material';

import type { SettingsButtonProps } from './SettingsButton.type';

const SettingsButton = ({ onClick, disabled }: SettingsButtonProps) => {
  return (
    <IconButton
      onClick={onClick}
      style={{ padding: '0px' }}
      disabled={disabled}
    >
      {' '}
      <SettingsApplicationsIcon
        style={{ width: '30px', height: '30px' }}
      />{' '}
    </IconButton>
  );
};

export default SettingsButton;
