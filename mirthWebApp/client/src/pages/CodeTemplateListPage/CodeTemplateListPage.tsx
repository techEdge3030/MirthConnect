import MainPageLayout from '../../layouts/MainPageLayout';
import { CodeTemplateListView } from '../../views';

const CodeTemplateListPage = () => {
  return (
    <MainPageLayout title="Code Templates">
      <CodeTemplateListView />
    </MainPageLayout>
  );
};

export default CodeTemplateListPage;
