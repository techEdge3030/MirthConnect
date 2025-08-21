import {
  AppBar,
  Box,
  Button,
  Divider,
  Grid,
  Menu,
  MenuItem,
  Toolbar
} from '@mui/material';
import type { MouseEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { MirthTable } from '../../components';
import { updateChannel } from '../../services';
import type { RootState } from '../../states';
import { updateFilterRule } from '../../states/channelReducer';
import type { Cell, Column, Row, TransformerJavascriptStep } from '../../types';
import JavascriptRuleView from './JavascriptRuleView';

const EditTransformerView = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const rules = useSelector(
    (state: RootState) =>
      state.channels.channel.sourceConnector.transformer.elements
  );
  const channel = useSelector((state: RootState) => state.channels.channel);
  const columns: Column[] = [
    { id: 'sequenceNumber', title: '#', width: '5%' },
    { id: 'name', title: 'Name', width: '85%' },
    { id: 'type', title: 'Type', width: '10%' }
  ];
  const rows: Row[] = useMemo(() => {
    // Ensure rules exist and are arrays
    const javascriptRules = Array.isArray(rules?.['com.mirth.connect.plugins.javascriptstep.JavaScriptStep']) 
      ? rules['com.mirth.connect.plugins.javascriptstep.JavaScriptStep'] 
      : [];
    
    const javascriptData: Row[] = javascriptRules.map(
      value =>
        ({
          id: value.sequenceNumber.toString(),
          sequenceNumber: {
            type: 'number',
            value: value.sequenceNumber
          },
          name: {
            type: 'text',
            value: value.name
          },
          type: {
            type: 'text',
            value: 'JavaScript'
          }
        }) as Row
    );
    const data = [...javascriptData];
    data.sort((a, b) => (a.id < b.id ? -1 : 1));
    return data;
  }, [rules]);
  const [currentRow, setCurrentRow] = useState<Row>(rows[0]);
  const dispatch = useDispatch();

  const getData = useCallback(
    (id: number) => {
      // Ensure rules exist and are arrays
      const javascriptRules = Array.isArray(rules?.['com.mirth.connect.plugins.javascriptstep.JavaScriptStep']) 
        ? rules['com.mirth.connect.plugins.javascriptstep.JavaScriptStep'] 
        : [];
      
      const javascriptData = javascriptRules.find(value => value.sequenceNumber === id);
      return javascriptData;
    },
    [rules]
  );

  const handleRowClick = (data: Row) => setCurrentRow(data);
  const JavascriptChange = (data: TransformerJavascriptStep) => {
    // Ensure rules exist and are arrays
    const javascriptRules = Array.isArray(rules?.['com.mirth.connect.plugins.javascriptstep.JavaScriptStep']) 
      ? rules['com.mirth.connect.plugins.javascriptstep.JavaScriptStep'] 
      : [];
    
    const javascriptData = javascriptRules.filter(value => value.sequenceNumber !== data.sequenceNumber);
    javascriptData.push(data);
    dispatch(
      updateFilterRule({
        'com.mirth.connect.plugins.javascriptstep.JavaScriptStep':
          javascriptData
      })
    );
  };
  const handleActionClick = (event: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleClickAddRule = () => {
    // Ensure rules exist and are arrays
    const javascriptRules = Array.isArray(rules?.['com.mirth.connect.plugins.javascriptstep.JavaScriptStep']) 
      ? rules['com.mirth.connect.plugins.javascriptstep.JavaScriptStep'] 
      : [];
    
    const javascriptData = [...javascriptRules];
    const total = javascriptData.length;
    javascriptData.push({
      '@version': '4.4.1',
      name: '',
      sequenceNumber: total,
      enabled: true,
      script: ''
    });
    dispatch(
      updateFilterRule({
        'com.mirth.connect.plugins.javascriptstep.JavaScriptStep':
          javascriptData
      })
    );
    handleClose();
  };
  const handleClickDeleteRule = () => {
    const id = Number(currentRow.id);
    // Ensure rules exist and are arrays
    const javascriptRules = Array.isArray(rules?.['com.mirth.connect.plugins.javascriptstep.JavaScriptStep']) 
      ? rules['com.mirth.connect.plugins.javascriptstep.JavaScriptStep'] 
      : [];
    
    const javascriptData = javascriptRules
      .filter(value => value.sequenceNumber !== id)
      .map(value => ({
        ...value,
        sequenceNumber:
          value.sequenceNumber < id
            ? value.sequenceNumber
            : value.sequenceNumber - 1
      }));

    dispatch(
      updateFilterRule({
        'com.mirth.connect.plugins.javascriptstep.JavaScriptStep':
          javascriptData
      })
    );

    const newJavascriptData = javascriptData.find(
      value => value.sequenceNumber === 0
    );
    if (newJavascriptData) {
      setCurrentRow({
        id: '0',
        sequenceNumber: {
          type: 'number',
          value: newJavascriptData.sequenceNumber
        },
        name: {
          type: 'text',
          value: newJavascriptData.name ?? '',
          editable: true
        },
        type: {
          type: 'text',
          value: 'JavaScript'
        }
      });
    }
  };
  const handleSaveClick = async () => {
    await updateChannel(channel);
    handleClose();
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        width: '100%',
        height: '100%',
        padding: '5px'
      }}
    >
      <Grid container direction="column" rowSpacing={1}>
        <Grid item flexGrow={0}>
          <AppBar position="static">
            <Toolbar style={{ minHeight: '45px' }}>
              <Button
                color="inherit"
                id="action-button"
                aria-controls={open ? 'action-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleActionClick}
              >
                Actions
              </Button>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClickAddRule}>Add Step</MenuItem>
                <MenuItem onClick={handleClickDeleteRule}>Delete Step</MenuItem>
                <Divider />
                <MenuItem onClick={handleSaveClick}>Save</MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>
        </Grid>

        <Grid item>
          <MirthTable
            rows={rows}
            columns={columns}
            onRowClick={handleRowClick}
          />
        </Grid>
      </Grid>

      {currentRow && (
        <Grid item>
          {(currentRow?.type as Cell)?.value === 'JavaScript' && (
            <JavascriptRuleView
              data={getData(Number(currentRow.id)) as TransformerJavascriptStep}
              onChange={JavascriptChange}
            />
          )}
        </Grid>
      )}
    </Box>
  );
};

export default EditTransformerView;
