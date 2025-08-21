import type {
  CodeTemplate,
  CodeTemplateLibrary
} from '../types/codeTemplate.type';
import { getMirthApiClient } from '../utils/api';

export const getAllCodeTemplateLibraries = async () => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.get('/codeTemplateLibraries?includeCodeTemplates=true');
  return response.data.list && response.data.list.codeTemplateLibrary
    ? Array.isArray(response.data.list.codeTemplateLibrary)
      ? response.data.list.codeTemplateLibrary
      : [response.data.list.codeTemplateLibrary]
    : [];
};

export const saveCodeTemplateLibrary = async (library: any) => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.post('/form/codeTemplateLibraries/_bulkUpdate?override=true', library);
  return response.data;
};

export const updateCodeTemplateLibraries = async (
  codeTemplateLibraries: Partial<CodeTemplateLibrary>[],
  codeTemplates: Partial<CodeTemplate>[]
) => {
  const response = await getMirthApiClient().post(
    '/form/codeTemplateLibraries/_bulkUpdate?override=true',
    [
      {
        list: {
          codeTemplateLibrary: codeTemplateLibraries
        }
      },
      {
        list: {
          codeTemplate: codeTemplates
        }
      }
    ],
    {
      headers: {
        multipart:
          'libraries;libraries.json;updatedCodeTemplates;updatedCodeTemplates.json'
      }
    }
  );
  return response.data.codeTemplateLibrarySaveResult;
};

export const createCodeTemplateLibrary = async (codeTemplateLibrary: Partial<CodeTemplateLibrary>) => {
  const mirthApiClient = getMirthApiClient();
  // The API expects a list of libraries, even for a single one
  const response = await mirthApiClient.post(
    '/form/codeTemplateLibraries/_bulkUpdate?override=true',
    {
      list: {
        codeTemplateLibrary: [codeTemplateLibrary]
      }
    },
    {
      headers: {
        multipart: 'libraries;libraries.json'
      }
    }
  );
  return response.data.codeTemplateLibrarySaveResult;
};
