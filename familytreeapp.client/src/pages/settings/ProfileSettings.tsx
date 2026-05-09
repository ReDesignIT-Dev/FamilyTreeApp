import { useState } from 'react';
import { Box, Button, Paper, TextField, Typography, Divider, Alert } from '@mui/material';
import { useAppSelector } from '@/reduxComponents/hooks';

export default function ProfileSettings() {
    const username = useAppSelector((state) => state.auth.username);
    const [displayName, setDisplayName] = useState(username ?? '');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        // TODO: dispatch update profile action
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Profile</Typography>
            <Divider sx={{ mb: 3 }} />

            {saved && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully.</Alert>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 480 }}>
                <TextField
                    label="Username"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    fullWidth
                />
                <Button variant="contained" onClick={handleSave} sx={{ alignSelf: 'flex-start' }}>
                    Save Changes
                </Button>
            </Box>
        </Paper>
    );
}