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
    alpha,
    Button,
} from '@mui/material';
import {
    Logout,
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

    if (!isLoggedIn) {
        return (
            <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(PATH_AUTH_LOGIN)}
                sx={{
                    borderColor: 'rgba(255,255,255,0.15)',
                    color: 'text.secondary',
                    '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                }}
            >
                Sign In
            </Button>
        );
    }

    return (
        <>
            <Tooltip title={username ?? 'Account'} arrow>
                <IconButton
                    onClick={handleOpen}
                    aria-label="account menu"
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    sx={{
                        p: 0.5,
                        border: `2px solid ${open ? '#4CAF7D' : 'rgba(255,255,255,0.12)'}`,
                        borderRadius: '50%',
                        transition: 'border-color 0.2s ease',
                        '&:hover': { borderColor: '#4CAF7D' },
                    }}
                >
                    {isLoading ? (
                        <CircularProgress size={28} sx={{ color: '#4CAF7D' }} />
                    ) : (
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #4CAF7D 0%, #2E7D52 100%)',
                            }}
                        >
                            {avatarInitial ?? <PersonOutlined sx={{ fontSize: 18 }} />}
                        </Avatar>
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
                        elevation: 0,
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
                                bgcolor: 'rgba(22,27,34,0.95)',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRight: 'none',
                                borderBottom: 'none',
                            },
                        },
                    },
                }}
            >
                {/* User identity header */}
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #4CAF7D 0%, #2E7D52 100%)',
                            }}
                        >
                            {avatarInitial}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} noWrap>
                                {username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Signed in
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider />

                <MenuItem onClick={() => handleNavigate(PATH_SETTINGS)}>
                    <ListItemIcon>
                        <SettingsOutlined fontSize="small" />
                    </ListItemIcon>
                    Settings
                </MenuItem>

                <Divider />

                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        color: 'error.main',
                        '&:hover': { bgcolor: alpha('#F85149', 0.1) },
                        '& .MuiListItemIcon-root': { color: 'error.main' },
                    }}
                >
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Sign Out
                </MenuItem>
            </Menu>
        </>
    );
}