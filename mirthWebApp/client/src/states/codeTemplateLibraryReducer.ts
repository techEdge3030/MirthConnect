import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { CodeTemplateLibrary } from '../types/codeTemplate.type';

export interface CodeTemplateLibraryState {
  codeTemplateLibrary: CodeTemplateLibrary;
}

const initialState: CodeTemplateLibraryState = {
  codeTemplateLibrary: {} as CodeTemplateLibrary
};

export const codeTemplateLibrarySlice = createSlice({
  name: 'codeTemplateLibrary',
  initialState,
  reducers: {
    setCodeTemplateLibrary: (state, action: PayloadAction<any>) => {
      state.codeTemplateLibrary = { ...action.payload };
    }
  }
});
