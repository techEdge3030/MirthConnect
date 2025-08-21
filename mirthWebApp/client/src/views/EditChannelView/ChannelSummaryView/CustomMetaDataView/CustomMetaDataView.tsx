import { Grid } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { GroupBox, MirthTable } from '../../../../components';
import type { RootState } from '../../../../states';
import { updateMetaDataColumns } from '../../../../states/channelReducer';
import type { Cell, Column, CustomMetaData, Row } from '../../../../types';
import { METADATA_TYPES } from './CustomMetadataView.constant';

const CustomMetaDataView = () => {
  const metadata: CustomMetaData[] = useSelector(
    (state: RootState) =>
      state.channels.channel.properties.metaDataColumns.metaDataColumn
  );
  const dispatch = useDispatch();

  const columns: Column[] = [
    { id: 'name', title: 'Column Name', align: 'center', width: '45%' },
    { id: 'type', title: 'Type', align: 'center', width: '10%' },
    {
      id: 'mappingName',
      title: 'Variable Mapping',
      align: 'center',
      width: '45%'
    }
  ];

  const rows: Row[] = metadata.map((data, index) => ({
    id: index.toString(),
    name: { value: data.name, type: 'text', editable: true },
    type: { value: data.type, type: 'select', items: METADATA_TYPES },
    mappingName: { value: data.mappingName, type: 'text', editable: true }
  }));

  const handleCellChange = (rowId: string, columnId: string, newCell: Cell) => {
    const newMetadata = metadata.map((data, index) => {
      if (index.toString() !== rowId) {
        return data;
      }
      const newData = { ...data };
      (newData as Record<string, any>)[columnId] = newCell.value;
      return newData;
    });
    dispatch(updateMetaDataColumns(newMetadata));
  };

  return (
    <div>
      <GroupBox label="Custom Metadata" border>
        <Grid container direction="row" columnSpacing={2}>
          <Grid item md={12}>
            <MirthTable
              rows={rows}
              columns={columns}
              onCellChange={handleCellChange}
            />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default CustomMetaDataView;
