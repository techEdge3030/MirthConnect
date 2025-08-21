import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

import AceEditor from 'react-ace';

import type { CodeEditorProps } from './CodeEditor.type';

const CodeEditor = ({ value, onChange, mode }: CodeEditorProps) => {
  return (
    <AceEditor
      height="100%"
      width="100%"
      value={value}
      mode={mode}
      theme="monokai"
      fontSize="16px"
      highlightActiveLine
      setOptions={{
        enableLiveAutocompletion: true,
        showLineNumbers: true,
        tabSize: 2
      }}
      onChange={onChange}
    />
  );
};

export default CodeEditor;
