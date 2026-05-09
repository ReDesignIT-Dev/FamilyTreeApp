import { NavLink, Outlet } from 'react-router-dom';
import { Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material';
import { DeleteForeverOutlined, LockOutlined, NotificationsOutlined, PersonOutlined, SecurityOutlined } from '@mui/icons-material';
import {
    PATH_SETTINGS_PROFILE,
    PATH_SETTINGS_CHANGE_PASSWORD,
    PATH_SETTINGS_SECURITY,
    PATH_SETTINGS_NOTIFICATIONS,
    PATH_SETTINGS_DANGER_ZONE,
} from '@/router/routes';

const navItems = [
    { label: 'Profile', path: PATH_SETTINGS_PROFILE, icon: <PersonOutlined /> },
    { label: 'Change Password', path: PATH_SETTINGS_CHANGE_PASSWORD, icon: <LockOutlined /> },
    { label: 'Security', path: PATH_SETTINGS_SECURITY, icon: <SecurityOutlined /> },
    { label: 'Notifications', path: PATH_SETTINGS_NOTIFICATIONS, icon: <NotificationsOutlined /> },
    { label: 'Danger Zone', path: PATH_SETTINGS_DANGER_ZONE, icon: <DeleteForeverOutlined />, danger: true },
];

export default function SettingsLayout() {
    return (
        <Box sx={{ display: 'flex', gap: 3, p: 3, maxWidth: 1100, mx: 'auto' }}>
            {/* Sidebar */}
            <Paper sx={{ width: 240, flexShrink: 0, height: 'fit-content' }} elevation={2}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ px: 2, pt: 2, pb: 1 }}>
                    Account Settings
                </Typography>
                <Divider />
                <List disablePadding>
                    {navItems.map(({ label, path, icon, danger }) => (
                        <ListItem key={path} disablePadding>
                            <ListItemButton
                                component={NavLink}
                                to={path}
                                sx={{
                                    color: danger ? 'error.main' : 'inherit',
                                    '&.active': {
                                        bgcolor: danger ? 'error.50' : 'primary.50',
                                        color: danger ? 'error.main' : 'primary.main',
                                        fontWeight: 600,
                                        '& .MuiListItemIcon-root': {
                                            color: danger ? 'error.main' : 'primary.main',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36, color: danger ? 'error.main' : 'inherit' }}>
                                    {icon}
                                </ListItemIcon>
                                <ListItemText primary={label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Outlet />
            </Box>
        </Box>
    );
}