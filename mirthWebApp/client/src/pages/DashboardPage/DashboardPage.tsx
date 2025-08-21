import MainPageLayout from '../../layouts/MainPageLayout';
import { DashboardView } from '../../views';

const DashboardPage = () => {
  return (
    <MainPageLayout title="Dashboard" currentSection="dashboard">
      <DashboardView />
    </MainPageLayout>
  );
};

export default DashboardPage;
