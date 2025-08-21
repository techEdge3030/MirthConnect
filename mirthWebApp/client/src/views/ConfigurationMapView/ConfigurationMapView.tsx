import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import {
  Box,
  Button,
  Grid,
  Modal,
  TextareaAutosize,
  Typography
} from '@mui/material';
import type {
  GridColDef,
  GridEventListener,
  GridRowEditStartParams,
  GridRowId,
  GridRowModel,
  GridRowModesModel,
  GridRowsProp
} from '@mui/x-data-grid-pro';
import {
  DataGridPro,
  GridActionsCellItem,
  GridRowModes,
  GridToolbarContainer
} from '@mui/x-data-grid-pro';
import { useEffect, useState } from 'react';

import {
  getAllConfigurationMapItems,
  saveConfigurationMapItems
} from '../../services/configurationMapService';
import type { ConfigurationMapItem } from '../../types/configurationMap.type';
import { generateUUID } from '../../utils/uuid';

interface Row {
  id: string;
  key: string;
  value: string;
  comment: string;
}

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
  handleSaveDataToMirth: () => void;
}

function EditToolbar(props: EditToolbarProps) {
  const { setRows, setRowModesModel, handleSaveDataToMirth } = props;

  const handleAddRow = () => {
    const id = generateUUID();
    setRows(oldRows => [
      ...oldRows,
      { id, key: 'Untitled Key', value: '', comment: '' }
    ]);
    setRowModesModel(oldModel => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'key' }
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleAddRow}>
        Add
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

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
};

const ConfigurationMapView = () => {
  const [rows, setRows] = useState<GridRowModel<Row>[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [isValuePopupOpen, setValuePopupOpen] = useState(false);
  const [valuePopupCurrentValue, setValuePopupCurrentValue] = useState('');
  const [currentEditingMapItemId, setCurrentEditingMapItemId] = useState('');

  useEffect(() => {
    getAllConfigurationMapItems().then(items => {
      setRows(generateRowData(items));
    });
  }, []);

  const generateRowData = (
    configurationMapItems: ConfigurationMapItem[]
  ): GridRowModel<Row>[] => {
    const data: GridRowModel<Row>[] = [];
    for (const item of configurationMapItems) {
      data.push({
        id: generateUUID(),
        key: item.string,
        value: item['com.mirth.connect.util.ConfigurationProperty'].value,
        comment: item['com.mirth.connect.util.ConfigurationProperty'].comment
      });
    }
    return data;
  };

  const columns: GridColDef[] = [
    {
      field: 'key',
      headerName: 'Key',
      width: 450,
      editable: true,
      type: 'string'
    },
    {
      field: 'value',
      headerName: 'Value',
      width: 450,
      editable: true,
      renderCell: params => {
        return <span className="password-letters">{params.value}</span>;
      },
      renderEditCell: params => {
        return <span className="password-letters">{params.value}</span>;
      }
    },
    {
      field: 'comment',
      headerName: 'comment',
      editable: true,
      type: 'string'
    },
    {
      field: 'action',
      headerName: 'Action',
      editable: false,
      type: 'actions',
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />
        ];
      }
    }
  ];

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStart: GridEventListener<'rowEditStart'> = (
    params: GridRowEditStartParams<Row>
  ) => {
    setCurrentEditingMapItemId(params.row.id);
    if (params.field === 'value') {
      setValuePopupOpen(true);
      setValuePopupCurrentValue(params.row.value);
    }
  };

  const handleSaveDataToMirth = async () => {
    const configurationMapItems = rows.map(row => {
      const item: ConfigurationMapItem = {
        string: row.key,
        'com.mirth.connect.util.ConfigurationProperty': {
          comment: row.comment,
          value: row.value
        }
      };
      return item;
    });
    await saveConfigurationMapItems(configurationMapItems);
    alert('Configuration Map Saved!');
  };

  const processRowUpdate = (newRow: GridRowModel<Row>) => {
    setRows(rows.map(row => (row.id === newRow.id ? newRow : row)));
    return newRow;
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter(row => row.id !== id));
  };

  const onSaveCurrentValueToDataGrid = () => {
    const updatedRows = rows.map(row =>
      row.id !== currentEditingMapItemId
        ? row
        : { ...row, value: valuePopupCurrentValue }
    );
    setTimeout(() => {
      setRows(updatedRows);
    }, 0);
    onCloseValuePopup();
  };

  const onCloseValuePopup = () => {
    setRowModesModel(oldModel => ({
      ...oldModel,
      [currentEditingMapItemId]: {
        mode: GridRowModes.View,
        fieldToFocus: 'value'
      }
    }));
    setValuePopupOpen(false);
  };

  return (
    <Grid
      container
      style={{ backgroundColor: 'white', height: '100%' }}
      direction="column"
    >
      <DataGridPro
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        disableMultipleRowSelection
        processRowUpdate={processRowUpdate}
        onRowEditStart={handleRowEditStart}
        slots={{
          toolbar: EditToolbar
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel, handleSaveDataToMirth }
        }}
      />
      <Modal open={isValuePopupOpen} onClose={onCloseValuePopup}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">
            Edit Value
          </Typography>
          <Typography sx={{ mt: 2 }}>
            <TextareaAutosize
              minRows={10}
              style={{ width: '100%' }}
              value={valuePopupCurrentValue}
              onChange={e => setValuePopupCurrentValue(e.target.value)}
            />
          </Typography>
          <Box marginTop={2}>
            <Button
              color="success"
              variant="contained"
              onClick={onSaveCurrentValueToDataGrid}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </Grid>
  );
};

export default ConfigurationMapView;
