import {
  Button,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography
} from '@mui/material';
import type { GridColDef, GridRowModel } from '@mui/x-data-grid';
import { DataGridPro } from '@mui/x-data-grid-pro';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { useEffect, useState } from 'react';

interface Row {
  id: string;
  name: string;
}

const contextScripts = [
  { id: 'GLOBAL', name: 'Global Scripts', parent: null },
  { id: 'GLOBAL_DEPLOY', name: 'Deploy Script', parent: 'GLOBAL' },
  { id: 'GLOBAL_UNDEPLOY', name: 'Undeploy Script', parent: 'GLOBAL' },
  { id: 'GLOBAL_PREPROCESSOR', name: 'Preprocessor Script', parent: 'GLOBAL' },
  {
    id: 'GLOBAL_POSTPROCESSOR',
    name: 'Postprocessor Script',
    parent: 'GLOBAL'
  },
  { id: 'CHANNEL', name: 'Channel Scripts', parent: null },
  { id: 'CHANNEL_DEPLOY', name: 'Deploy Script', parent: 'CHANNEL' },
  { id: 'CHANNEL_UNDEPLOY', name: 'Undeploy Script', parent: 'CHANNEL' },
  {
    id: 'CHANNEL_PREPROCESSOR',
    name: 'Preprocessor Script',
    parent: 'CHANNEL'
  },
  {
    id: 'CHANNEL_POSTPROCESSOR',
    name: 'Postprocessor Script',
    parent: 'CHANNEL'
  },
  { id: 'CHANNEL_ATTACHMENT', name: 'Attachment Script', parent: 'CHANNEL' },
  { id: 'CHANNEL_BATCH', name: 'Batch Script', parent: 'CHANNEL' },
  { id: 'SOURCE', name: 'Source Connector', parent: null },
  { id: 'SOURCE_RECEIVER', name: 'Receiver Script(s)', parent: 'SOURCE' },
  {
    id: 'SOURCE_FILTER_TRANSFORMER',
    name: 'Filter / Transformer Script',
    parent: 'SOURCE'
  },
  { id: 'DESTINATION', name: 'Destination Connector', parent: null },
  {
    id: 'DESTINATION_FILTER_TRANSFORMER',
    name: 'Filter / Transformer Script',
    parent: 'DESTINATION'
  },
  {
    id: 'DESTINATION_DISPATCHER',
    name: 'Dispatcher Script',
    parent: 'DESTINATION'
  },
  {
    id: 'DESTINATION_RESPONSE_TRANSFORMER',
    name: 'Response Transformer Script',
    parent: 'DESTINATION'
  }
];

const columns: GridColDef[] = [{ field: 'name', headerName: 'Name', flex: 1 }];

interface ILibraryViewProps {
  code: string;
  type: string;
  selectedContextScripts: string[];
  onSave: (
    code: string,
    type: string,
    selectedContextScripts: string[]
  ) => void;
}

const CodeTemplateView = (props: ILibraryViewProps) => {
  const [rows, setRows] = useState<GridRowModel<Row>[]>([]);
  const [code, setCode] = useState('');
  const [type, setType] = useState('');
  const [selectedContextScripts, setSelectedContextScripts] = useState<
    string[]
  >([]);

  useEffect(() => {
    setSelectedContextScripts(props.selectedContextScripts);
  }, [props.selectedContextScripts]);

  useEffect(() => {
    setCode(props.code);
    setType(props.type);
  }, [props.code, props.type]);

  useEffect(() => {
    setRows(generateRowData());
  }, []);

  const generateRowData = (): GridRowModel<Row>[] => {
    const data: GridRowModel<Row>[] = [];
    for (const script of contextScripts) {
      data.push({
        id: script.id,
        name: !script.parent ? script.name : `___${script.name}`
      });
    }
    return data;
  };

  const onSelectScript = (ids: string[]) => {
    const selectedScriptIds = ids.filter(
      id =>
        contextScripts.find(script => script.id === id && script.parent) as any
    );
    console.log(selectedScriptIds);
    setSelectedContextScripts(selectedScriptIds);
  };

  return (
    <Stack direction="column">
      <Stack direction="row" spacing={0.5}>
        <Grid
          paddingLeft={3}
          paddingTop={1}
          rowSpacing={0.5}
          columnSpacing={2}
          alignItems="center"
          flex={3}
        >
          <div>
            <Typography variant="h6">Type:</Typography>
          </div>
          <div>
            <Select
              value={type}
              variant="outlined"
              sx={{ width: '300px' }}
              onChange={e => setType(e.target.value)}
            >
              <MenuItem value="FUNCTION">Function</MenuItem>
              <MenuItem value="DRAG_AND_DROP_CODE">
                Drag-and-Drop Code Block
              </MenuItem>
              <MenuItem value="COMPILED_CODE">Compiled Code Block</MenuItem>
            </Select>
          </div>
          <div>
            <Typography variant="h6">Code:</Typography>
          </div>
          <div>
            <CodeEditor
              value={code}
              language="js"
              onChange={e => setCode(e.target.value)}
              padding={15}
              style={{
                backgroundColor: '#f5f5f5',
                fontFamily:
                  'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace'
              }}
            />
          </div>
        </Grid>
        <Grid
          container
          direction="column"
          paddingTop={1}
          flex={2}
          overflow="auto"
          maxHeight={500}
        >
          <Typography variant="h6">Context Scripts</Typography>
          <DataGridPro
            // treeData
            columns={columns}
            rows={rows}
            checkboxSelection
            onRowSelectionModelChange={(ids: any) => onSelectScript(ids)}
            rowSelectionModel={selectedContextScripts}
            // getTreeDataPath={(row) => row.name}
            isGroupExpandedByDefault={() => true}
          />
        </Grid>
      </Stack>
      <Grid
        item
        flexGrow={0}
        style={{ marginTop: '10px', marginBottom: '10px' }}
      >
        <Stack direction="row" justifyContent="space-evenly">
          <Button
            variant="contained"
            color="success"
            onClick={() => props.onSave(code, type, selectedContextScripts)}
          >
            Save
          </Button>
        </Stack>
      </Grid>
    </Stack>
  );
};

export default CodeTemplateView;
