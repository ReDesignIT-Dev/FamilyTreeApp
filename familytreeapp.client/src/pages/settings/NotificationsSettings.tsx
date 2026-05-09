import { useState } from 'react';
import { Box, Button, Divider, FormControlLabel, Paper, Switch, Typography, Alert } from '@mui/material';

export default function NotificationsSettings() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        // TODO: dispatch save notifications preferences action
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Notifications</Typography>
            <Divider sx={{ mb: 3 }} />

            {saved && <Alert severity="success" sx={{ mb: 2 }}>Preferences saved.</Alert>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                    control={<Switch checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />}
                    label="Email notifications"
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    Receive updates about your family tree activity via email.
                </Typography>
            </Box>

            <Button variant="contained" onClick={handleSave} sx={{ mt: 3 }}>
                Save Preferences
            </Button>
        </Paper>
    );
}