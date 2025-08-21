import MainPageLayout from '../../layouts/MainPageLayout';
import LibraryAddView from '../../views/CodeTemplateListView/LibraryAddView';

const LibraryAddPage = () => {
  return (
    <MainPageLayout title="Add Code Template Library">
      <LibraryAddView />
    </MainPageLayout>
  );
};

export default LibraryAddPage;
