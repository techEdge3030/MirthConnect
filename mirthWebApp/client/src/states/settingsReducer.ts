import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  currentTab: number;
  isDirty: boolean;
  dirtyFields: string[];
}

const initialState: SettingsState = {
  currentTab: 0,
  isDirty: false,
  dirtyFields: []
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setCurrentTab: (state, action: PayloadAction<number>) => {
      state.currentTab = action.payload;
    },
    setDirty: (state, action: PayloadAction<boolean>) => {
      state.isDirty = action.payload;
      if (!action.payload) {
        state.dirtyFields = [];
      }
    },
    addDirtyField: (state, action: PayloadAction<string>) => {
      if (!state.dirtyFields.includes(action.payload)) {
        state.dirtyFields.push(action.payload);
        state.isDirty = true;
      }
    },
    removeDirtyField: (state, action: PayloadAction<string>) => {
      state.dirtyFields = state.dirtyFields.filter(field => field !== action.payload);
      state.isDirty = state.dirtyFields.length > 0;
    }
  }
});

export const { setCurrentTab, setDirty, addDirtyField, removeDirtyField } = settingsSlice.actions;
export default settingsSlice.reducer;
