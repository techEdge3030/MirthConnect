import { Grid, TextField } from '@mui/material';
import type { ChangeEvent } from 'react';

import { GroupBox } from '../../../components';
import type { ExternalScriptViewProps } from './ExternalScriptView.constant';

const ExternalScriptView = ({ data, onChange }: ExternalScriptViewProps) => {
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (onChange) {
      onChange({
        ...data,
        scriptPath: event.target.value
      });
    }
  };
  return (
    <GroupBox label="External Script" border>
      <Grid
        container
        direction="row"
        rowSpacing={0.5}
        columnSpacing={2}
        alignItems="center"
      >
        <Grid item md={12}>
          Enter the path of an external JavaScript file accessible from the
          Mirth Connect server.
        </Grid>

        <Grid item md={0.7}>
          Script Path:
        </Grid>
        <Grid item md={1}>
          {' '}
          <TextField
            value={data.sequenceNumber}
            fullWidth
            onChange={handleChange}
          />{' '}
        </Grid>
        <Grid item md={1}>
          {' '}
          <TextField
            value={data.scriptPath}
            fullWidth
            onChange={handleChange}
          />{' '}
        </Grid>
      </Grid>
    </GroupBox>
  );
};

export default ExternalScriptView;
