export interface CodeEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  mode: 'javascript' | 'sql';
}
