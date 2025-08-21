export interface AlertStatus {
  id: string;
  name: string;
  enabled: boolean;
  alertedCount: number;
}

export interface AlertModel {
  id?: string;
  name: string;
  enabled: boolean;
  trigger: AlertTrigger;
  actionGroups: AlertActionGroup[];
  properties?: Record<string, any>;
}

export interface AlertTrigger {
  type: string; // e.g., 'DefaultTrigger'
  errorEventTypes: string[]; // e.g., ['SOURCE_ERROR', 'DESTINATION_ERROR']
  regex?: string;
  alertChannels?: AlertChannels;
}

export interface AlertChannels {
  // Map of channelId to enabled/disabled, and connectorId to enabled/disabled
  [channelId: string]: {
    enabled: boolean;
    connectors: {
      [connectorId: string]: boolean;
    };
  };
}

export interface AlertActionGroup {
  subject?: string;
  template?: string;
  actions: AlertAction[];
}

export interface AlertAction {
  protocol: string; // e.g., 'Email'
  recipient: string;
} 