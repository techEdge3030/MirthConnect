import { configureStore } from '@reduxjs/toolkit';
import channelReducer from './channelReducer';
import settingsReducer from './settingsReducer';

export const store = configureStore({
  reducer: {
    channels: channelReducer,
    settings: settingsReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
