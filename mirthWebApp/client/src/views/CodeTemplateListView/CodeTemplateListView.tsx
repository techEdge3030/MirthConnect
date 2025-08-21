import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { Button, Grid } from '@mui/material';
import type {
  GridColDef,
  GridRowId,
  GridRowModel,
  GridRowModesModel,
  GridRowParams,
  GridRowsProp
} from '@mui/x-data-grid-pro';
import {
  DataGridPro,
  GridActionsCellItem,
  GridRowModes,
  GridToolbarContainer
} from '@mui/x-data-grid-pro';
import { useCallback, useEffect, useState } from 'react';

import {
  getAllCodeTemplateLibraries,
  updateCodeTemplateLibraries
} from '../../services/codeTemplatesService';
import type {
  CodeTemplate,
  CodeTemplateLibrary
} from '../../types/codeTemplate.type';
import { formatDate } from '../../utils/date';
import { generateUUID } from '../../utils/uuid';
import CodeTemplateView from './CodeTemplateView';
import LibraryView from './LibraryView';

interface Row {
  id: string;
  name: string[];
  selectedChannelIds: string[];
  description: string;
  revision: number;
  lastModified: string;
  code?: string;
  type?: string;
  selectedContextScripts?: string[];
}

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
  handleSaveDataToMirth: () => void;
  getSelectedRow: () => Row | undefined;
  checkDuplicatedName: (name: string[]) => boolean;
}

function EditToolbar(props: EditToolbarProps) {
  const {
    setRows,
    setRowModesModel,
    handleSaveDataToMirth,
    getSelectedRow,
    checkDuplicatedName
  } = props;
  const row = getSelectedRow();

  const handleAddLibraryRow = () => {
    const id = generateUUID();
    const newLibrary: Partial<CodeTemplateLibrary> = {
      '@version': '4.4.1',
      id,
      name: 'Untitled Library',
      description: '',
      revision: 1,
      includeNewChannels: false,
      enabledChannelIds: null,
      disabledChannelIds: null,
      codeTemplates: null
    };
    while (checkDuplicatedName([newLibrary.name as string])) {
      newLibrary.name += '-';
    }
    setRows(oldRows => [
      ...oldRows,
      {
        id,
        name: [newLibrary.name],
        description: '',
        revision: 1,
        lastModified: formatDate(new Date())
      }
    ]);
    setRowModesModel(oldModel => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' }
    }));
  };

  const handleAddCodeRow = () => {
    const id = generateUUID();
    const newCode: Partial<CodeTemplate> = {
      '@version': '4.4.1',
      id,
      name: 'Untitled Code',
      revision: 1,
      properties: {
        '@class':
          'com.mirth.connect.model.codetemplates.BasicCodeTemplateProperties',
        code: '/**\n\tModify the description here. Modify the function name and parameters as needed. One function per\n\ttemplate is recommended; create a new code template for each new function.\n\n\t@param {String} arg1 - arg1 description\n\t@return {String} return description\n*/\nfunction new_function1(arg1) {\n\t// TODO: Enter code here\n}',
        type: 'FUNCTION'
      }
    };
    while (
      checkDuplicatedName([row?.name[0] as string, newCode.name as string])
    ) {
      newCode.name += '-';
    }
    setRows(oldRows => [
      ...oldRows,
      {
        id,
        name: [row?.name[0], newCode.name],
        description: '',
        revision: 1,
        lastModified: formatDate(new Date())
      }
    ]);
    setRowModesModel(oldModel => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' }
    }));
  };

  return (
    <GridToolbarContainer>
      <Button
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddLibraryRow}
      >
        Add Library
      </Button>
      <Button
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddCodeRow}
        disabled={!row}
      >
        Add Code
      </Button>
      <Button
        color="primary"
        startIcon={<SaveIcon />}
        onClick={handleSaveDataToMirth}
      >
        Save
      </Button>
    </GridToolbarContainer>
  );
}

const CodeTemplateListView = () => {
  const [rows, setRows] = useState<GridRowModel<Row>[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [activeRowId, setActiveRowId] = useState('');

  useEffect(() => {
    getAllCodeTemplateLibraries().then(libraries => {
      setRows(generateRowData(libraries));
    });
  }, []);

  const columns: GridColDef[] = [
    { field: 'description', headerName: 'Description', width: 500 },
    { field: 'revision', headerName: 'Revision' },
    { field: 'lastModified', headerName: 'Last Modified', width: 200 },
    {
      field: 'action',
      headerName: 'Action',
      editable: false,
      type: 'actions',
      getActions: ({ id }) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={handleDeleteClick(id)}
          color="inherit"
        />
      ]
    }
  ];

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter(row => row.id !== id));
  };

  const generateRowData = (
    libraries: CodeTemplateLibrary[]
  ): GridRowModel<Row>[] => {
    const data: GridRowModel<Row>[] = [];
    for (const library of libraries) {
      data.push({
        id: library.id,
        description: library.description!,
        revision: library.revision,
        name: [library.name],
        lastModified: formatDate(new Date(library.lastModified.time)),
        selectedChannelIds: library.enabledChannelIds?.string || []
      });
      if (library.codeTemplates) {
        for (const codeTemplate of library.codeTemplates.codeTemplate) {
          data.push({
            id: codeTemplate.id as string,
            description: '',
            revision: codeTemplate.revision as number,
            name: [library.name, codeTemplate.name as string],
            lastModified: formatDate(
              new Date(codeTemplate.lastModified?.time as number)
            ),
            selectedChannelIds: library.enabledChannelIds?.string || [],
            code: codeTemplate.properties?.code,
            type: codeTemplate.properties?.type,
            selectedContextScripts:
              codeTemplate.contextSet?.delegate.contextType
          });
        }
      }
    }
    return data;
  };

  const onRowClick = useCallback((params: GridRowParams<Row>) => {
    setActiveRowId(params.row.id);
  }, []);

  const checkDuplicatedName = (name: string[]) => {
    return !!rows.find(row => row.name.toString() === name.toString());
  };

  const getSelectedRow = () => {
    return rows.find(row => row.id === activeRowId);
  };

  const currentRow = getSelectedRow();

  const handleSaveDataToMirth = async () => {
    const libraries = [];
    const codeTemplates = [];
    for (const row of rows) {
      let library: Partial<CodeTemplateLibrary>;
      if (row.name.length === 1) {
        library = {
          '@version': '4.4.1',
          id: row.id,
          name: row.name[0],
          description: row.description,
          revision: row.revision,
          includeNewChannels: false,
          enabledChannelIds: row.selectedChannelIds.length
            ? { string: row.selectedChannelIds }
            : null,
          disabledChannelIds: null,
          codeTemplates: null
        };
        libraries.push(library);
      } else {
        library = libraries.find(lib => lib.name === row.name[0])!;
        const code: CodeTemplate = {
          '@version': '4.4.1',
          id: row.id,
          name: row.name[1],
          revision: row.revision,
          properties: {
            '@class':
              'com.mirth.connect.model.codetemplates.BasicCodeTemplateProperties',
            code:
              row.code ||
              '/**\n\tModify the description here. Modify the function name and parameters as needed. One function per\n\ttemplate is recommended; create a new code template for each new function.\n\n\t@param {String} arg1 - arg1 description\n\t@return {String} return description\n*/\nfunction new_function1(arg1) {\n\t// TODO: Enter code here\n}',
            type: row.type || 'FUNCTION'
          },
          contextSet: row.selectedContextScripts
            ? {
                delegate: {
                  contextType: row.selectedContextScripts
                }
              }
            : undefined
        };
        codeTemplates.push(code);
        const codeSimple: Partial<CodeTemplate> = {
          '@version': '4.4.1',
          id: row.id
        };
        if (!library.codeTemplates) {
          library.codeTemplates = {
            codeTemplate: [codeSimple]
          };
        } else {
          library.codeTemplates.codeTemplate.push(codeSimple);
        }
      }
    }
    console.log({ libraries, rows });
    await updateCodeTemplateLibraries(libraries, codeTemplates);
    alert('Successfully updated!');
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const processRowUpdate = (newRow: GridRowModel<Row>) => {
    setRows(rows.map(row => (row.id === newRow.id ? newRow : row)));
    return newRow;
  };

  const onUpdateLibrary = (
    name: string,
    description: string,
    selectedChannelIds: string[]
  ) => {
    const oldName = currentRow?.name[0];
    // Check duplication
    if (name !== oldName && rows.find(row => row.name[0] === name)) {
      alert('Duplicated name');
      return;
    }
    const newRows = rows.map(row => {
      if (row.name[0] === oldName) {
        const newRow = { ...row };
        newRow.name[0] = name;
        if (row.id === currentRow?.id) newRow.description = description;
        newRow.selectedChannelIds = [...selectedChannelIds];
        return newRow;
      }
      return row;
    });
    setRows(newRows);
  };

  const onUpdateCodeTemplate = (
    code: string,
    type: string,
    selectedContextScripts: string[]
  ) => {
    const oldName = currentRow?.name[1];
    const newRows = rows.map(row => {
      if (row.name[1] === oldName) {
        const newRow = { ...row };
        if (row.id === currentRow?.id) {
          newRow.code = code;
          newRow.type = type;
          newRow.selectedContextScripts = [...selectedContextScripts];
        }
        return newRow;
      }
      return row;
    });
    setRows(newRows);
  };

  return (
    <Grid
      container
      style={{ backgroundColor: 'white', height: '100%' }}
      direction="column"
    >
      <Grid item flexGrow={1}>
        <DataGridPro
          treeData
          rows={rows}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          processRowUpdate={processRowUpdate}
          disableMultipleRowSelection
          groupingColDef={{ headerName: 'Name', width: 500 }}
          getTreeDataPath={row => row.name}
          onRowClick={onRowClick}
          isGroupExpandedByDefault={() => true}
          slots={{
            toolbar: EditToolbar
          }}
          slotProps={{
            toolbar: {
              setRows,
              setRowModesModel,
              handleSaveDataToMirth,
              getSelectedRow,
              checkDuplicatedName
            }
          }}
        />
      </Grid>
      <Grid item flexGrow={3}>
        {currentRow?.name.length === 1 && (
          <LibraryView
            name={currentRow?.name[0]}
            description={currentRow.description}
            selectedChannelIds={currentRow.selectedChannelIds}
            onSave={onUpdateLibrary}
          />
        )}
        {currentRow?.name.length === 2 && (
          <CodeTemplateView
            code={currentRow?.code || ''}
            type={currentRow?.type || ''}
            selectedContextScripts={currentRow?.selectedContextScripts || []}
            onSave={onUpdateCodeTemplate}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default CodeTemplateListView;
