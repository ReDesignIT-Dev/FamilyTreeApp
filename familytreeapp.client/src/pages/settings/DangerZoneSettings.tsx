import { useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Paper, TextField, Typography } from '@mui/material';
import { useAppDispatch } from '@/reduxComponents/hooks';
import { logout } from '@/reduxComponents/reduxUser/Auth/authReducer';

export default function DangerZoneSettings() {
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (confirm !== 'DELETE') { setError('Type DELETE to confirm.'); return; }
        // TODO: call API to delete account
        // await deleteAccount();
        await dispatch(logout());
    };

    return (
        <Paper elevation={2} sx={{ p: 3, border: '1px solid', borderColor: 'error.main' }}>
            <Typography variant="h6" fontWeight={700} color="error" gutterBottom>Danger Zone</Typography>
            <Divider sx={{ mb: 3 }} />

            <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Delete Account</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Permanently delete your account and all associated data. This action cannot be undone.
                </Typography>
                <Button variant="outlined" color="error" onClick={() => setOpen(true)}>
                    Delete My Account
                </Button>
            </Box>

            <Dialog open={open} onClose={() => { setOpen(false); setConfirm(''); setError(null); }}>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        This will permanently delete your account. Type <strong>DELETE</strong> to confirm.
                    </DialogContentText>
                    {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
                    <TextField
                        autoFocus
                        fullWidth
                        value={confirm}
                        onChange={(e) => { setConfirm(e.target.value); setError(null); }}
                        placeholder="Type DELETE"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpen(false); setConfirm(''); setError(null); }}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>Confirm Delete</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}