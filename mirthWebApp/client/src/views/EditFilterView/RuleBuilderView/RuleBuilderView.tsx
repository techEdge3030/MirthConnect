import { FormControlLabel, Grid, Radio, TextField } from '@mui/material';

import { GroupBox } from '../../../components';
import type { RuleBuilderViewProps } from './RuleBuilderView.constant';

const RuleBuilderView = ({ data }: RuleBuilderViewProps) => {
  return (
    <GroupBox label="rule" border>
      <Grid
        container
        direction="row"
        rowSpacing={0.5}
        columnSpacing={2}
        alignItems="center"
      >
        <Grid item md={1}>
          {' '}
          Behavior:{' '}
        </Grid>
        <Grid item md={11}>
          Accept
        </Grid>

        <Grid item md={1}>
          {' '}
          Field:{' '}
        </Grid>
        <Grid item md={11}>
          <TextField fullWidth value={data.field} />
        </Grid>

        <Grid item md={1}>
          {' '}
          Condition:{' '}
        </Grid>
        <Grid item md={11}>
          <FormControlLabel
            label="Exists"
            labelPlacement="end"
            control={<Radio checked={data.condition === 'Exists'} />}
          />
          <FormControlLabel
            label="Not Exists"
            labelPlacement="end"
            control={<Radio checked={data.condition === 'NOT_Exists'} />}
          />
          <FormControlLabel
            label="Equals"
            labelPlacement="end"
            control={<Radio checked={data.condition === 'EQUALS'} />}
          />
          <FormControlLabel
            label="Not Equal"
            labelPlacement="end"
            control={<Radio checked={data.condition === 'Not Equal'} />}
          />
          <FormControlLabel
            label="Contains"
            labelPlacement="end"
            control={<Radio checked={data.condition === 'CONTAIN'} />}
          />
          <FormControlLabel
            label="Not Contain"
            labelPlacement="end"
            control={<Radio checked={data.condition === 'NOT_CONTAIN'} />}
          />
        </Grid>
      </Grid>
    </GroupBox>
  );
};

export default RuleBuilderView;
