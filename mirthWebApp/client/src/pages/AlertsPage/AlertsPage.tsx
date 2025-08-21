import MainPageLayout from '../../layouts/MainPageLayout';
import AlertsView from '../../views/AlertsView';
import { useState, useCallback } from 'react';
import { enableAlert, disableAlert, deleteAlert, createAlert } from '../../services/alertsService';
import NewAlertDialog from '../../components/AlertsPanel/NewAlertDialog';

const AlertsPage = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [newAlertOpen, setNewAlertOpen] = useState(false);

  const handleEnableSelected = useCallback(async () => {
    await Promise.all(selected.map(id => enableAlert(id)));
    setRefreshFlag(f => f + 1);
  }, [selected]);

  const handleDisableSelected = useCallback(async () => {
    await Promise.all(selected.map(id => disableAlert(id)));
    setRefreshFlag(f => f + 1);
  }, [selected]);

  const handleDeleteSelected = useCallback(async () => {
    await Promise.all(selected.map(id => deleteAlert(id)));
    setRefreshFlag(f => f + 1);
  }, [selected]);

  const handleNewAlert = useCallback(() => {
    setNewAlertOpen(true);
  }, []);

  const handleNewAlertClose = useCallback(() => {
    setNewAlertOpen(false);
  }, []);

  const handleNewAlertSubmit = useCallback(async (alertData) => {
    await createAlert(alertData);
    setNewAlertOpen(false);
    setRefreshFlag(f => f + 1);
  }, []);

  return (
    <MainPageLayout
      title="Alerts"
      currentSection="alerts"
      onAlertEnableSelected={handleEnableSelected}
      onAlertDisableSelected={handleDisableSelected}
      onAlertDeleteSelected={handleDeleteSelected}
      onAlertNew={handleNewAlert}
    >
      <AlertsView
        selected={selected}
        setSelected={setSelected}
        refreshFlag={refreshFlag}
      />
      <NewAlertDialog open={newAlertOpen} onClose={handleNewAlertClose} onSubmit={handleNewAlertSubmit} />
    </MainPageLayout>
  );
};

export default AlertsPage; 