import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  KeyboardArrowUp
} from '@mui/icons-material';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface DynamicSubSidebarProps {
  title: string;
  items: SidebarItem[];
  width?: number;
  collapsible?: boolean;
}

export const DynamicSubSidebar: React.FC<DynamicSubSidebarProps> = ({
  title,
  items,
  width = 200,
  collapsible = true
}) => {
  const [collapsed, setCollapsed] = React.useState(false);

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Paper
      elevation={1}
      sx={{
        width: collapsed ? 60 : width,
        minWidth: collapsed ? 60 : width,
        height: '100%',
        borderRadius: 0,
        borderRight: 1,
        borderColor: 'divider',
        transition: 'width 0.2s ease-in-out',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 64
        }}
      >
        {!collapsed && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              fontSize: '1rem',
              color: 'primary.main',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {title}
          </Typography>
        )}
        {collapsible && (
          <IconButton
            onClick={handleToggleCollapse}
            size="small"
            sx={{
              ml: collapsed ? 0 : 1,
              transform: collapsed ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease-in-out'
            }}
          >
            <KeyboardArrowUp />
          </IconButton>
        )}
      </Box>

      {/* Menu Items */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <List sx={{ p: 1 }}>
          {items.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={item.onClick}
                disabled={item.disabled}
                sx={{
                  borderRadius: 1,
                  minHeight: 40,
                  px: collapsed ? 1 : 2,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 40,
                    justifyContent: 'center',
                    color: item.disabled ? 'action.disabled' : 'primary.main'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 'medium',
                      color: item.disabled ? 'text.disabled' : 'text.primary'
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};
