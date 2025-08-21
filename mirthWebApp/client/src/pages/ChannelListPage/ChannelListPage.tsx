import MainPageLayout from '../../layouts/MainPageLayout';
import { ChannelListView } from '../../views';

const ChannelListPage = () => {
  return (
    <MainPageLayout title="Channels" currentSection="channels">
      <ChannelListView />
    </MainPageLayout>
  );
};

export default ChannelListPage;
