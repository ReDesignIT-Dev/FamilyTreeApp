import React, { useState } from "react";
import { Alert, Box, Button, Paper, Typography } from "@mui/material";
import EmailField from "@/components/auth/fields/EmailField";
import { postPasswordRecovery } from "@/services/auth/apiRequestsUser";

const ForgotPasswordFormComponent: React.FC = () => {
    const [email, setEmail] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await postPasswordRecovery({ email });
            setSubmitted(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center">
            <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Forgot Password
                </Typography>
                {submitted ? (
                    <Alert severity="success">
                        If an account with that email exists, a reset link has been sent.
                    </Alert>
                ) : (
                    <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
                        <EmailField value={email} onChange={setEmail} onValidate={setIsEmailValid} disabled={false} />
                        <Button type="submit" variant="contained" fullWidth disabled={!isEmailValid || isLoading}>
                            Send Reset Link
                        </Button>
                        {error && <Alert severity="warning">{error}</Alert>}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default ForgotPasswordFormComponent;