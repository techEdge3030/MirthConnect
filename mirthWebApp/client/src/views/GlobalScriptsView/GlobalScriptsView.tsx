import {
  AppBar,
  Box,
  Button,
  Grid,
  Menu,
  MenuItem,
  Toolbar
} from '@mui/material';
import type { MouseEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { CodeEditor, MirthSelect } from '../../components';
import { SCRIPT_TYPES } from '../../constants/constants';
import { getGlobalScripts, saveGloalScripts } from '../../services';
import type { GlobalScript } from '../../types';

const GlobalScriptsView = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [scripts, setScripts] = useState<GlobalScript>({} as GlobalScript);
  const [scriptType, setScriptType] = useState('Deploy');
  const code = useMemo(() => {
    const script = scripts.map
      ? scripts.map.entry.find(data => data.string[0] === scriptType)
      : '';
    return script ? script.string[1] : '';
  }, [scripts.map?.entry, scriptType]);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getGlobalScripts();
      setScripts(data);
    };
    fetchData();
  }, []);

  const handleActionClick = (event: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleChange = (value: string) => {
    const newScripts = scripts.map.entry.filter(
      data => data.string[0] !== scriptType
    );
    newScripts.push({
      string: [scriptType, value]
    });
    setScripts({
      ...scripts,
      map: {
        ...scripts.map,
        entry: [...newScripts]
      }
    });
  };
  const handleChangeScriptTypes = (value: string) => setScriptType(value);
  const handleSaveClick = async () => {
    await saveGloalScripts(scripts);
    handleClose();
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', width: '100%', height: '100%' }}>
      <Grid container direction="column" height="100%">
        <Grid item flexGrow={0}>
          <AppBar position="static">
            <Toolbar style={{ minHeight: '45px' }}>
              <MirthSelect
                value={scriptType}
                items={SCRIPT_TYPES}
                onChange={handleChangeScriptTypes}
              />
              <div style={{ flexGrow: 1 }} />
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
                <MenuItem onClick={handleSaveClick}>Save</MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>
        </Grid>

        <Grid item flexGrow={1}>
          <CodeEditor value={code} onChange={handleChange} mode="javascript" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default GlobalScriptsView;
