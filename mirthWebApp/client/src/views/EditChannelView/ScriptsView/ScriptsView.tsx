import { FormControlLabel, Grid } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CodeEditor, MirthSelect } from '../../../components';
import { SCRIPT_TYPES } from '../../../constants/constants';
import type { RootState } from '../../../states';
import {
  updateChannelDeployScript,
  updateChannelPostprocessingScript,
  updateChannelPreprocessingScript,
  updateChannelUndeployScript
} from '../../../states/channelReducer';

const ScriptsView = () => {
  const [scriptType, setScriptType] = useState('deploy');
  const channel = useSelector((state: RootState) => state.channels.channel);
  const dispatch = useDispatch();
  const code = useMemo(() => {
    switch (scriptType) {
      case 'deploy':
        return channel.deployScript ? channel.deployScript.toString() : '';
      case 'undeploy':
        return channel.undeployScript ? channel.undeployScript.toString() : '';
      case 'preprocessor':
        return channel.preprocessingScript
          ? channel.preprocessingScript.toString()
          : '';
      case 'postprocessor':
        return channel.postprocessingScript
          ? channel.postprocessingScript.toString()
          : '';
      default:
        return '';
    }
  }, [
    scriptType,
    channel.deployScript,
    channel.undeployScript,
    channel.preprocessingScript,
    channel.postprocessingScript
  ]);

  const handleChangeScriptType = (value: string) => setScriptType(value);
  const updateChannelScript = useCallback(
    (code: string) => {
      switch (scriptType) {
        case 'deploy':
          dispatch(updateChannelDeployScript(code));
          break;
        case 'undeploy':
          dispatch(updateChannelUndeployScript(code));
          break;
        case 'preprocessor':
          dispatch(updateChannelPreprocessingScript(code));
          break;
        case 'postprocessor':
          dispatch(updateChannelPostprocessingScript(code));
          break;
      }
    },
    [scriptType]
  );

  return (
    <Grid
      container
      direction="column"
      rowSpacing={2}
      height="100%"
      padding="10px"
    >
      <Grid item flexGrow={0}>
        <FormControlLabel
          label="Script:"
          labelPlacement="start"
          control={
            <MirthSelect
              value={scriptType}
              items={SCRIPT_TYPES}
              onChange={handleChangeScriptType}
            />
          }
        />
      </Grid>

      <Grid item flexGrow={1}>
        <CodeEditor
          value={code}
          onChange={updateChannelScript}
          mode="javascript"
        />
      </Grid>
    </Grid>
  );
};

export default ScriptsView;
