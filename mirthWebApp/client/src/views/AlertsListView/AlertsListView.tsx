import React from 'react';
import { Paper, Typography } from '@mui/material';

const AlertsListView = ({ registerHandlers }) => {
 React.useEffect(() => {
 registerHandlers({
 handleCreateAlert: () => {},
 handleEditAlert: () => {},
 handleDeleteAlert: () => {},
 handleEnableAlert: () => {},
 handleDisableAlert: () => {},
 handleRefresh: () => {}
 });
 }, []);

 return (
 <Paper sx={{ p: 2, mt: 2 }}>
 <Typography variant='h6'>Alerts Working</Typography>
 </Paper>
 );
};

export default AlertsListView;