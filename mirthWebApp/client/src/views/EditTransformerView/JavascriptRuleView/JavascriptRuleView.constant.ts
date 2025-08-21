import type { TransformerJavascriptStep } from '../../../types';

export interface JavascriptRuleViewProps {
  data: TransformerJavascriptStep;
  onChange?: (event: TransformerJavascriptStep) => void;
}
