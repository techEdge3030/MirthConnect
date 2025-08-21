import type { BaseObject, BaseTime } from './base.type';

export interface CodeTemplateLibrary extends BaseObject {
  codeTemplateLibrary: any;
  lastModified: BaseTime;
  includeNewChannels: boolean;
  codeTemplates?: {
    codeTemplate: Partial<CodeTemplate>[];
  } | null;
  enabledChannelIds?: {
    string: string[];
  } | null;
  disabledChannelIds?: {
    string: string[];
  } | null;
}

export interface CodeTemplate extends BaseObject {
  lastModified?: BaseTime;
  properties: {
    '@class': string;
    type: string;
    code: string;
  };
  contextSet?: {
    delegate: {
      contextType: string[];
    };
  } | null;
}
