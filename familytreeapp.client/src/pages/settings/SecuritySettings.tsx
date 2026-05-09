import { Box, Divider, Paper, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';

export default function SecuritySettings() {
    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Security</Typography>
            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Active Sessions</Typography>
            <List disablePadding>
                <ListItem disableGutters divider>
                    <ListItemText
                        primary="Current session"
                        secondary="Windows · Chrome · Today"
                    />
                    <Chip label="Active" color="success" size="small" />
                </ListItem>
            </List>

            <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Two-Factor Authentication</Typography>
                <Typography variant="body2" color="text.secondary">
                    2FA is not yet enabled. This feature is coming soon.
                </Typography>
            </Box>
        </Paper>
    );
}