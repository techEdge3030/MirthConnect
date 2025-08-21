import type { DestinationConnector } from '../../../types';

export interface DestinationSettingsProps {
  current: number | null;
  destinations: DestinationConnector[];
}
