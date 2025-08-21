import { Button, Grid, TextField } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createCodeTemplateLibrary } from '../../services/codeTemplatesService';
import type { CodeTemplateLibrary } from '../../types/codeTemplate.type';
import { generateUUID } from '../../utils/uuid';

const LibraryAddView = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const onCreateLibrary = async () => {
    const newLibrary: Partial<CodeTemplateLibrary> = {
      '@version': '4.4.1',
      id: generateUUID(),
      name,
      description: '',
      revision: 1,
      includeNewChannels: false,
      enabledChannelIds: null,
      disabledChannelIds: null,
      codeTemplates: null
    };
    await createCodeTemplateLibrary(newLibrary);
    navigate('/code-templates');
  };

  return (
    <Grid
      container
      style={{ backgroundColor: 'white', height: '100%' }}
      direction="column"
    >
      <Grid item flexGrow={1} margin={3}>
        <TextField
          label="Name"
          placeholder="Input library name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        &nbsp;
        <Button
          variant="contained"
          color="success"
          onClick={onCreateLibrary}
          disabled={!name}
        >
          Create
        </Button>
      </Grid>
    </Grid>
  );
};

export default LibraryAddView;
