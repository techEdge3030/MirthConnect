import {
  FormControlLabel,
  Grid,
  Radio,
  TextField,
  Typography
} from '@mui/material';
import type { ChangeEvent } from 'react';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { GroupBox, MirthSelect } from '../../../../components';
import type { RootState } from '../../../../states';
import {
  updateClassName,
  updateServiceName,
  updateSoapBinding
} from '../../../../states/channelReducer';
import { BINDING_TYPE } from './WebServiceListener.constant';

const WebServiceListenerSettingsView = () => {
  const setting = useSelector(
    (state: RootState) => state.channels.channel.sourceConnector.properties
  );
  const dispatch = useDispatch();
  const [isDefaultService, setDefaultService] = useState(
    setting.className === 'com.mirth.connect.connectors.ws.DefaultAcceptMessage'
  );
  const wsdlUrl = useMemo(
    () => `http://localhost:8081/services/${setting.serviceName}?wsdl`,
    [setting.serviceName]
  );
  const method = useMemo(
    () =>
      isDefaultService
        ? 'String acceptMessage(String message)'
        : '<Custom Web Service Method>',
    [isDefaultService]
  );

  const handleChangeWebServiceDefault = () => {
    dispatch(
      updateClassName('com.mirth.connect.connectors.ws.DefaultAcceptMessage')
    );
    setDefaultService(true);
  };
  const handleChangeWebServiceCustom = () => setDefaultService(false);
  const handleChangeServiceClassName = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateClassName(event.target.value));
  const handleChangeServiceName = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateServiceName(event.target.value));
  const handleChangeBinding = (value: string) =>
    dispatch(updateSoapBinding(value));

  return (
    <div>
      <GroupBox label="Web Service Listener Settings">
        <Grid
          container
          direction="row"
          rowSpacing={0.5}
          columnSpacing={2}
          alignItems="center"
        >
          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Web Service:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Default Service"
              labelPlacement="end"
              control={
                <Radio
                  checked={isDefaultService}
                  onClick={handleChangeWebServiceDefault}
                />
              }
            />
            <FormControlLabel
              label="Custom Service"
              labelPlacement="end"
              control={
                <Radio
                  checked={!isDefaultService}
                  onClick={handleChangeWebServiceCustom}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Service Class Name:
            </Typography>
          </Grid>

          <Grid item md={3}>
            <TextField
              value={setting.className}
              onChange={handleChangeServiceClassName}
              disabled={isDefaultService}
              fullWidth
            />
          </Grid>

          <Grid item md={7.5} />

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Service Class Name:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={setting.serviceName}
              onChange={handleChangeServiceName}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Binding:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value={setting.soapBinding}
              onChange={handleChangeBinding}
              items={BINDING_TYPE}
              fullWdith
            />
          </Grid>

          <Grid item md={9.5} />

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              WSDL URL:
            </Typography>
          </Grid>

          <Grid item md={2.5}>
            <TextField value={wsdlUrl} disabled fullWidth />
          </Grid>

          <Grid item md={8} />

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Method:
            </Typography>
          </Grid>

          <Grid item md={2.5}>
            <TextField value={method} disabled fullWidth />
          </Grid>

          <Grid item md={8} />
        </Grid>
      </GroupBox>
    </div>
  );
};

export default WebServiceListenerSettingsView;
