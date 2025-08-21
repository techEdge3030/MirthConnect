import type { FilterExternalScriptRule } from '../../../types';

export interface ExternalScriptViewProps {
  data: FilterExternalScriptRule;
  onChange?: (data: FilterExternalScriptRule) => void;
}
