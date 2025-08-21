import { Grid, Typography } from '@mui/material';

import { GroupBox, MirthSelect } from '../../../components';
import { AUTHENTICATION_TYPES } from './SourceView.constant';

const HttpAuthenticationView = () => {
  return (
    <div>
      <GroupBox label="HTTP Authentication">
        <Grid
          container
          direction="row"
          rowSpacing={0.5}
          columnSpacing={2}
          alignItems="center"
        >
          <Grid item md={1.1}>
            <Typography variant="subtitle1" textAlign="right">
              Authentication Type:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value="None"
              items={AUTHENTICATION_TYPES}
              onChange={() => {}}
              fullWdith
            />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default HttpAuthenticationView;
