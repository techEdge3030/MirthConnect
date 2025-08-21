import { useState, useEffect } from 'react';

export interface ColumnConfig {
  title: string;
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
  align?: 'left' | 'right' | 'center';
}

export function useGroupedChannelsWithResizableColumns({
  channels,
  groups,
  columnConfig,
  groupByDeployed = false,
}: {
  channels: any[];
  groups: any[];
  columnConfig: ColumnConfig[];
  groupByDeployed?: boolean;
}) {
  // Grouping logic
  const [groupedChannels, setGroupedChannels] = useState<{ [group: string]: any[] }>({});
  useEffect(() => {
    const channelIdToGroup: Record<string, string> = {};
    groups.forEach(group => {
      if (group.channels && group.channels.channel) {
        const groupChannels = Array.isArray(group.channels.channel)
          ? group.channels.channel
          : [group.channels.channel];
        groupChannels.forEach((ch: any) => {
          channelIdToGroup[ch.id] = group.name;
        });
      }
    });
    const groupsMap: { [group: string]: any[] } = {};
    channels
      .filter(channel => (groupByDeployed ? channel.deployed === true : true))
      .forEach(channel => {
        const groupName = channelIdToGroup[channel.id] || '[Default Group]';
        if (!groupsMap[groupName]) groupsMap[groupName] = [];
        groupsMap[groupName].push(channel);
      });
    setGroupedChannels(groupsMap);
  }, [channels, groups, groupByDeployed]);

  // Column resize logic
  const DEFAULT_COLUMN_WIDTHS = columnConfig.map(col => col.defaultWidth);
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
  const handleResize = (index: number, newWidth: number) => {
    setColumnWidths(widths => {
      const updated = [...widths];
      updated[index] = Math.max(
        columnConfig[index].minWidth,
        Math.min(newWidth, columnConfig[index].maxWidth)
      );
      return updated;
    });
  };

  // Allow resetting widths if config changes
  useEffect(() => {
    setColumnWidths(columnConfig.map(col => col.defaultWidth));
  }, [columnConfig]);

  return {
    groupedChannels,
    columnWidths,
    handleResize,
    setColumnWidths,
  };
} 