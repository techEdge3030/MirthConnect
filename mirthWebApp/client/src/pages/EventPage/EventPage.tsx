import MainPageLayout from '../../layouts/MainPageLayout';
import EventView from '../../views/EventView';

const EventPage = () => {
  return (
    <MainPageLayout title="Events">
      <EventView />
    </MainPageLayout>
  );
};

export default EventPage;
