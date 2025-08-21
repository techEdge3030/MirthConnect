import React from 'react';
import AlertsPanel from '../../components/AlertsPanel';

interface AlertsViewProps {
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  refreshFlag: number;
}

const AlertsView: React.FC<AlertsViewProps> = ({ selected, setSelected, refreshFlag }) => {
  return (
    <AlertsPanel
      selected={selected}
      setSelected={setSelected}
      refreshFlag={refreshFlag}
    />
  );
};

export default AlertsView; 