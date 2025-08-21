import { TextareaAutosize } from '@mui/material';
import type { ChangeEvent } from 'react';

import { GroupBox } from '../../../components';
import type { JavascriptRuleViewProps } from './JavascriptRuleView.constant';

const JavascriptRuleView = ({ data, onChange }: JavascriptRuleViewProps) => {
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (onChange) {
      onChange({
        ...data,
        script: event.target.value
      });
    }
  };
  return (
    <GroupBox label="Javascript Rule">
      <TextareaAutosize
        minRows={10}
        maxRows={10}
        style={{ width: '100%' }}
        value={data.script}
        onChange={handleChange}
      />
    </GroupBox>
  );
};

export default JavascriptRuleView;
