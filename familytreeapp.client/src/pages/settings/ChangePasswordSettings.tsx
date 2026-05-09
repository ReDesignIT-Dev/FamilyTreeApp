import { useState } from 'react';
import { Alert, Box, Button, Divider, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { PASSWORD_RULES } from '@/config';

interface FormState {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function ChangePasswordSettings() {
    const [form, setForm] = useState<FormState>({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPasswords, setShowPasswords] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setError(null);
    };

    const validate = (): string | null => {
        if (!form.currentPassword) return 'Current password is required.';
        if (form.newPassword.length < PASSWORD_RULES.minLength)
            return `New password must be at least ${PASSWORD_RULES.minLength} characters.`;
        if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(form.newPassword))
            return 'New password must contain an uppercase letter.';
        if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(form.newPassword))
            return 'New password must contain a lowercase letter.';
        if (PASSWORD_RULES.requireDigit && !/\d/.test(form.newPassword))
            return 'New password must contain a digit.';
        if (PASSWORD_RULES.requireSpecialChar && !/[^A-Za-z0-9]/.test(form.newPassword))
            return 'New password must contain a special character.';
        if (form.newPassword !== form.confirmPassword)
            return 'Passwords do not match.';
        return null;
    };

    const handleSubmit = async () => {
        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        setIsLoading(true);
        try {
            // TODO: call API to change password
            // await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
            setSuccess(true);
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(false), 4000);
        } catch {
            setError('Failed to change password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Change Password</Typography>
            <Divider sx={{ mb: 3 }} />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>Password changed successfully.</Alert>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 480 }}>
                <TextField
                    label="Current Password"
                    type={showPasswords ? 'text' : 'password'}
                    value={form.currentPassword}
                    onChange={handleChange('currentPassword')}
                    fullWidth
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPasswords((p) => !p)} edge="end">
                                    {showPasswords ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    label="New Password"
                    type={showPasswords ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={handleChange('newPassword')}
                    fullWidth
                    helperText={`Min. ${PASSWORD_RULES.minLength} characters, uppercase, lowercase, digit, special character.`}
                />
                <TextField
                    label="Confirm New Password"
                    type={showPasswords ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    fullWidth
                />
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    sx={{ alignSelf: 'flex-start' }}
                >
                    {isLoading ? 'Saving...' : 'Change Password'}
                </Button>
            </Box>
        </Paper>
    );
}