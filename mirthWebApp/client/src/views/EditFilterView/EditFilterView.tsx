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
import type {
  Cell,
  Column,
  FilterExternalScriptRule,
  FilterJavascriptRule,
  FilterRuleBuilder,
  Row
} from '../../types';
import { FILTER_RULE_TYPES } from './EditFilterView.constant';
import ExternalScriptView from './ExternalScriptView';
import JavascriptRuleView from './JavascriptRuleView';
import RuleBuilderView from './RuleBuilderView';

const EditFilterView = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const rules = useSelector(
    (state: RootState) => state.channels.channel.sourceConnector.filter.elements
  );
  const channel = useSelector((state: RootState) => state.channels.channel);
  const columns: Column[] = [
    { id: 'sequenceNumber', title: '#', width: '5%' },
    { id: 'name', title: 'Name', width: '85%' },
    { id: 'type', title: 'Type', width: '10%' }
  ];
  const rows: Row[] = useMemo(() => {
    console.log('@@@@', rules);
    
    // Ensure rules exist and are arrays
    const javascriptRules = Array.isArray(rules?.['com.mirth.connect.plugins.javascriptrule.JavaScriptRule']) 
      ? rules['com.mirth.connect.plugins.javascriptrule.JavaScriptRule'] 
      : [];
    const externalScriptRules = Array.isArray(rules?.['com.mirth.connect.plugins.scriptfilerule.ExternalScriptRule']) 
      ? rules['com.mirth.connect.plugins.scriptfilerule.ExternalScriptRule'] 
      : [];
    const ruleBuilderRules = Array.isArray(rules?.['com.mirth.connect.plugins.rulebuilder.RuleBuilderRule']) 
      ? rules['com.mirth.connect.plugins.rulebuilder.RuleBuilderRule'] 
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
            type: 'select',
            value: 'JavaScript',
            items: FILTER_RULE_TYPES
          }
        }) as Row
    );
    const externalScriptData: Row[] = externalScriptRules.map(
      value =>
        ({
          id: value.sequenceNumber.toString(),
          sequenceNumber: {
            type: 'number',
            value: value.sequenceNumber
          },
          name: {
            type: 'text',
            value: value.name ?? ''
          },
          type: {
            type: 'select',
            value: 'External Script',
            items: FILTER_RULE_TYPES
          }
        }) as Row
    );
    const ruleBuilderData: Row[] = ruleBuilderRules.map(
      value =>
        ({
          id: value.sequenceNumber.toString(),
          sequenceNumber: {
            type: 'number',
            value: value.sequenceNumber
          },
          name: {
            type: 'text',
            value: value.name ?? ''
          },
          type: {
            type: 'select',
            value: 'Rule Builder',
            items: FILTER_RULE_TYPES
          }
        }) as Row
    );
    const data = [...javascriptData, ...externalScriptData, ...ruleBuilderData];
    data.sort((a, b) => (a.id < b.id ? -1 : 1));
    return data;
  }, [rules]);
  const [currentRow, setCurrentRow] = useState<Row>(rows[0]);
  const dispatch = useDispatch();

  const getData = useCallback(
    (id: number) => {
      // Ensure rules exist and are arrays
      const javascriptRules = Array.isArray(rules?.['com.mirth.connect.plugins.javascriptrule.JavaScriptRule']) 
        ? rules['com.mirth.connect.plugins.javascriptrule.JavaScriptRule'] 
        : [];
      const ruleBuilderRules = Array.isArray(rules?.['com.mirth.connect.plugins.rulebuilder.RuleBuilderRule']) 
        ? rules['com.mirth.connect.plugins.rulebuilder.RuleBuilderRule'] 
        : [];
      const externalScriptRules = Array.isArray(rules?.['com.mirth.connect.plugins.scriptfilerule.ExternalScriptRule']) 
        ? rules['com.mirth.connect.plugins.scriptfilerule.ExternalScriptRule'] 
        : [];
      
      const javascriptData = javascriptRules.find(value => value.sequenceNumber === id);
      if (javascriptData) {
        return javascriptData;
      }

      const ruleBuilderData = ruleBuilderRules.find(value => value.sequenceNumber === id);
      if (ruleBuilderData) {
        return ruleBuilderData;
      }

      const externalScriptData = externalScriptRules.find(value => value.sequenceNumber === id);
      return externalScriptData;
    },
    [rules]
  );

  const handleRowClick = (data: Row) => setCurrentRow(data);
  const ExternalScriptChange = (data: FilterExternalScriptRule) => {
    // Ensure rules exist and are arrays
    const externalScriptRules = Array.isArray(rules?.['com.mirth.connect.plugins.scriptfilerule.ExternalScriptRule']) 
      ? rules['com.mirth.connect.plugins.scriptfilerule.ExternalScriptRule'] 
      : [];
    const javascriptRules = Array.isArray(rules?.['com.mirth.connect.plugins.javascriptrule.JavaScriptRule']) 
      ? rules['com.mirth.connect.plugins.javascriptrule.JavaScriptRule'] 
      : [];
    const ruleBuilderRules = Array.isArray(rules?.['com.mirth.connect.plugins.rulebuilder.RuleBuilderRule']) 
      ? rules['com.mirth.connect.plugins.rulebuilder.RuleBuilderRule'] 
      : [];
    
    const externalScriptData = externalScriptRules.filter(value => value.sequenceNumber !== data.sequenceNumber);
    const javascriptData = javascriptRules.filter(value => value.sequenceNumber !== data.sequenceNumber);
    const ruleBuilderData = ruleBuilderRules.filter(value => value.sequenceNumber !== data.sequenceNumber);
    externalScriptData.push(data);
    dispatch(
      updateFilterRule({
        'com.mirth.connect.plugins.scriptfilerule.ExternalScriptRule':
          externalScriptData,
        'com.mirth.connect.plugins.javascriptrule.JavaScriptRule':
          javascriptData,
        'com.mirth.connect.plugins.rulebuilder.RuleBuilderRule': ruleBuilderData
      })
    );
  };
  const JavascriptChange = (data: FilterJavascriptRule) => {
    // Ensure rules exist and are arrays
    const externalScriptRules = Array.isArray(rules?.['com.mirth.connect.plugins.scriptfilerule.ExternalScriptRule']) 
      ? rules['com.mirth.connect.plugins.scriptfilerule.ExternalScriptRule'] 
      : [];
    const javascriptRules = Array.isArray(rules?.['com.mirth.connect.plugins.javascriptrule.JavaScriptRule']) 
      ? rules['com.mirth.connect.plugins.javascriptrule.JavaScriptRule'] 
      : [];
    const ruleBuilderRules = Array.isArray(rules?.['com.mirth.connect.plugins.rulebuilder.RuleBuilderRule']) 
      ? rules['com.mirth.connect.plugins.rulebuilder.RuleBuilderRule'] 
      : [];
    
    const externalScriptData = externalScriptRules.filter(value => value.sequenceNumber !== data.sequenceNumber);
    const javascriptData = javascriptRules.filter(value => value.sequenceNumber !== data.sequenceNumber);
    const ruleBuilderData = ruleBuilderRules.filter(value => value.sequenceNumber !== data.sequenceNumber);
    javascriptData.push(data);
    dispatch(
      updateFilterRule({
        'com.mirth.connect.plugins.scriptfilerule.ExternalScriptRule':
          externalScriptData,
        'com.mirth.connect.plugins.javascriptrule.JavaScriptRule':
          javascriptData,
        'com.mirth.connect.plugins.rulebuilder.RuleBuilderRule': ruleBuilderData
      })
    );
  };
  const handleActionClick = (event: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleClickAddRule = () => {
    const externalScriptData = [
      ...rules['com.mirth.connect.plugins.scriptfilerule.ExternalScriptRule']
    ];
    const javascriptData = [
      ...rules['com.mirth.connect.plugins.javascriptrule.JavaScriptRule']
    ];
    const ruleBuilderData = [
      ...rules['com.mirth.connect.plugins.rulebuilder.RuleBuilderRule']
    ];
    const total =
      externalScriptData.length +
      javascriptData.length +
      ruleBuilderData.length;
    externalScriptData.push({
      '@version': '4.4.1',
      name: '',
      sequenceNumber: total,
      enabled: true,
      scriptPath: ''
    });
    dispatch(
      updateFilterRule({
        'com.mirth.connect.plugins.scriptfilerule.ExternalScriptRule':
          externalScriptData,
        'com.mirth.connect.plugins.javascriptrule.JavaScriptRule':
          javascriptData,
        'com.mirth.connect.plugins.rulebuilder.RuleBuilderRule': ruleBuilderData
      })
    );
    handleClose();
  };
  const handleClickDeleteRule = () => {
    const id = Number(currentRow.id);
    const externalScriptData = rules[
      'com.mirth.connect.plugins.scriptfilerule.ExternalScriptRule'
    ]
      .filter(value => value.sequenceNumber !== id)
      .map(value => ({
        ...value,
        sequenceNumber:
          value.sequenceNumber < id
            ? value.sequenceNumber
            : value.sequenceNumber - 1
      }));
    const javascriptData = rules[
      'com.mirth.connect.plugins.javascriptrule.JavaScriptRule'
    ]
      .filter(value => value.sequenceNumber !== id)
      .map(value => ({
        ...value,
        sequenceNumber:
          value.sequenceNumber < id
            ? value.sequenceNumber
            : value.sequenceNumber - 1
      }));
    const ruleBuilderData = rules[
      'com.mirth.connect.plugins.rulebuilder.RuleBuilderRule'
    ]
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
        'com.mirth.connect.plugins.scriptfilerule.ExternalScriptRule':
          externalScriptData,
        'com.mirth.connect.plugins.javascriptrule.JavaScriptRule':
          javascriptData,
        'com.mirth.connect.plugins.rulebuilder.RuleBuilderRule': ruleBuilderData
      })
    );

    const newExternalScriptData = externalScriptData.find(
      value => value.sequenceNumber === 0
    );
    if (newExternalScriptData) {
      setCurrentRow({
        id: '0',
        sequenceNumber: {
          type: 'number',
          value: newExternalScriptData.sequenceNumber
        },
        name: {
          type: 'text',
          value: newExternalScriptData.name,
          editable: true
        },
        type: {
          type: 'select',
          value: 'External Script',
          items: FILTER_RULE_TYPES
        }
      });
    }

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
          type: 'select',
          value: 'JavaScript',
          items: FILTER_RULE_TYPES
        }
      });
    }

    const newRuleBuilderData = externalScriptData.find(
      value => value.sequenceNumber === 0
    );
    if (newRuleBuilderData) {
      setCurrentRow({
        id: '0',
        sequenceNumber: {
          type: 'number',
          value: newRuleBuilderData.sequenceNumber
        },
        name: {
          type: 'text',
          value: newRuleBuilderData.name,
          editable: true
        },
        type: {
          type: 'select',
          value: 'Rule Builder',
          items: FILTER_RULE_TYPES
        }
      });
    }
    handleClose();
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
                <MenuItem onClick={handleClickAddRule}>Add Rule</MenuItem>
                <MenuItem onClick={handleClickDeleteRule}>Delete Rule</MenuItem>
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
          {(currentRow?.type as Cell)?.value === 'External Script' && (
            <ExternalScriptView
              data={getData(Number(currentRow.id)) as FilterExternalScriptRule}
              onChange={ExternalScriptChange}
            />
          )}
          {(currentRow?.type as Cell)?.value === 'JavaScript' && (
            <JavascriptRuleView
              data={getData(Number(currentRow.id)) as FilterJavascriptRule}
              onChange={JavascriptChange}
            />
          )}
          {(currentRow?.type as Cell)?.value === 'Rule Builder' && (
            <RuleBuilderView
              data={getData(Number(currentRow.id)) as FilterRuleBuilder}
            />
          )}
        </Grid>
      )}
    </Box>
  );
};

export default EditFilterView;
