import MainPageLayout from '../../layouts/MainPageLayout';
import { SettingsView } from '../../views';

const SettingsPage = () => {
  return (
    <MainPageLayout title="Settings" currentSection="settings">
      <SettingsView />
    </MainPageLayout>
  );
};

export default SettingsPage; 