import MenuIcon from '@mui/icons-material/Menu';
import type { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MuiAppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { useAdministratorBackground } from '../../providers';
import type { IHeaderProps } from './Header.type';

const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
  backgroundColor?: string;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: prop => prop !== 'open' && prop !== 'backgroundColor'
})<AppBarProps>(({ theme, open, backgroundColor }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: backgroundColor || theme.palette.primary.main,
  transition: theme.transitions.create(['width', 'margin', 'background-color'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin', 'background-color'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

const Header = ({ title, open, handleDrawerOpen }: IHeaderProps) => {
  const { backgroundColor } = useAdministratorBackground();

  return (
    <AppBar position="fixed" open={open} backgroundColor={backgroundColor}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{
            marginRight: 5,
            ...(open && { display: 'none' })
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
