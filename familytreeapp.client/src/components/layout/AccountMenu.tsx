import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  EmailOutlined,
  Logout,
  LockOutlined,
  PersonOutlined,
  SettingsOutlined,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/reduxComponents/hooks';
import { logout } from '@/reduxComponents/reduxUser/Auth/authReducer';
import { PATH_AUTH_LOGIN, PATH_SETTINGS } from '@/router/routes';

export default function AccountMenu() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const username = useAppSelector((state) => state.auth.username);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (!isLoggedIn) {
      navigate(PATH_AUTH_LOGIN);
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  const handleLogout = async () => {
    handleClose();
    await dispatch(logout());
    navigate(PATH_AUTH_LOGIN);
  };

  const avatarInitial = username ? username[0].toUpperCase() : undefined;

  return (
    <>
      <Tooltip title={isLoggedIn ? username ?? 'Account' : 'Sign in'}>
        <IconButton
          onClick={handleOpen}
          color="inherit"
          aria-label="account menu"
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          size="large"
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isLoggedIn && avatarInitial ? (
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.875rem',
                bgcolor: 'secondary.main',
              }}
            >
              {avatarInitial}
            </Avatar>
          ) : (
            <PersonOutlined />
          )}
        </IconButton>
      </Tooltip>

      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              minWidth: 220,
              overflow: 'visible',
              mt: 1.5,
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
      >
        {/* User identity header */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600} noWrap>
            {username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Signed in
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={() => handleNavigate(`${PATH_SETTINGS}?tab=password`)}>
          <ListItemIcon>
            <LockOutlined fontSize="small" />
          </ListItemIcon>
          Change Password
        </MenuItem>

        <MenuItem onClick={() => handleNavigate(`${PATH_SETTINGS}?tab=email`)}>
          <ListItemIcon>
            <EmailOutlined fontSize="small" />
          </ListItemIcon>
          Change Email
        </MenuItem>

        <MenuItem onClick={() => handleNavigate(PATH_SETTINGS)}>
          <ListItemIcon>
            <SettingsOutlined fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
}