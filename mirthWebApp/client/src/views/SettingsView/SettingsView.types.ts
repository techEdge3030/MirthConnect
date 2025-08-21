import { SystemPreferences, UserPreferences, CodeEditorPreferences } from '../../services/settingsService';

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface FormRowProps {
  label: string;
  tooltip: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export interface SettingsState {
  systemPrefs: SystemPreferences;
  userPrefs: UserPreferences;
  codeEditorPrefs: CodeEditorPreferences;
}

export interface ServerInfo {
  name?: string;
  version?: string;
  jvmVersion?: string;
  osName?: string;
  osVersion?: string;
  databaseType?: string;
  uptime?: string;
  memoryUsage?: string;
  activeChannels?: string;
}

export interface ServerVersion {
  string: string;
}

export interface ConfigMapEntry {
  string: string;
  'com.mirth.connect.util.ConfigurationProperty': {
    value: string;
    comment: string;
  };
}

export interface EditingEntry {
  key: string;
  value: string;
  comment: string;
  originalKey?: string;
  isNew: boolean;
}

export interface Resource {
  name: string;
  type: string;
  description: string;
}

export interface PrunerSettings {
  enabled: boolean;
  pruneContentDays: string;
  pruneMetaDataDays: string;
  archiveEnabled: boolean;
  pruneErroredMessages: boolean;
}

export interface SettingsTabProps {
  systemPrefs: SystemPreferences;
  userPrefs: UserPreferences;
  codeEditorPrefs: CodeEditorPreferences;
  onSystemPrefChange: (key: keyof SystemPreferences, value: string) => void;
  onUserPrefChange: (key: keyof UserPreferences, value: string) => void;
  onCodeEditorPrefChange: (key: keyof CodeEditorPreferences, value: any) => void;
  authError: boolean;
  saving: boolean;
}

export interface ServerTabProps {
  serverInfo: ServerInfo | null;
  serverVersion: ServerVersion | null;
}

export interface TagsTabProps {
  tags: string[];
  onAddTag: (tag: string) => Promise<void>;
  onDeleteTag: (tag: string) => Promise<void>;
}

export interface ConfigurationMapTabProps {
  configMapEntries: ConfigMapEntry[];
  onSaveEntry: (entry: EditingEntry) => Promise<void>;
  onDeleteEntry: (key: string) => Promise<void>;
}

export interface DatabaseTasksTabProps {
  databaseTasks: any[];
}

export interface ResourcesTabProps {
  resources: Resource[];
}

export interface DataPrunerTabProps {
  prunerSettings: PrunerSettings;
  onPrunerSettingsChange: (settings: PrunerSettings) => void;
}

// Tooltip content mapping
export const TOOLTIPS = {
  dashboardRefreshInterval: 'How often the dashboard refreshes automatically (in seconds)',
  messageBrowserPageSize: 'Number of messages displayed per page in the message browser',
  eventBrowserPageSize: 'Number of events displayed per page in the event browser',
  formatTextInMessageBrowser: 'Whether to format text content in the message browser for better readability',
  messageBrowserTextSearchConfirmation: 'Show confirmation dialog when performing text searches in message browser',
  filterTransformerIteratorDialog: 'Show iterator dialog when editing filters and transformers',
  messageBrowserAttachmentTypeDialog: 'Show dialog for selecting attachment types in message browser',
  reprocessRemoveMessagesConfirmation: 'Show confirmation dialog when reprocessing or removing messages',
  importCodeTemplateLibraries: 'Automatically import code template libraries when importing channels',
  exportCodeTemplateLibraries: 'Automatically export code template libraries when exporting channels',
  checkNotificationsOnLogin: 'Check for new system notifications when logging into the administrator',
  serverDefaultColor: 'Use the default background color provided by the server',
  customBackgroundColor: 'If selected, the following custom color will be used for the Administrator GUI',
  codeEditorTheme: 'Color theme for the code editor interface',
  fontSize: 'Font size for text in the code editor',
  wordWrap: 'Wrap long lines of code to fit within the editor window',
  autoComplete: 'Enable automatic code completion suggestions',
  showLineNumbers: 'Display line numbers in the code editor',
  showGutter: 'Show the gutter area with line numbers and folding controls',
  highlightActiveLine: 'Highlight the current line where the cursor is located',
  showInvisibles: 'Display invisible characters like spaces and tabs'
} as const;

// Constants
export const TABS = [
  'Server',
  'Administrator',
  'Tags',
  'Configuration Map',
  'Database Tasks',
  'Resources',
  'Data Pruner'
] as const;

export const DEFAULT_SERVER_TAB = 0; 