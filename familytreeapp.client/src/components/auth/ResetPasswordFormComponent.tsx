import React, { useState } from "react";
import { Alert, Box, Button, Paper, Typography } from "@mui/material";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import NewPasswordWithPasswordRepeatField from "@/components/auth/fields/NewPasswordWithPasswordRepeatField";
import RecaptchaField from "@/components/auth/fields/RecaptchaField";
import { postPasswordReset } from "@/services/auth/apiRequestsUser";
import { PATH_AUTH_LOGIN } from "@/router/routes";

const ResetPasswordFormComponent: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [reCaptchaToken, setReCaptchaToken] = useState<string | null>(null);
    const [isValidReCaptchaToken, setIsValidReCaptchaToken] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const canSubmit = isValid && isValidReCaptchaToken && !isLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !token) return;
        setIsLoading(true);
        setError(null);
        try {
            await postPasswordReset(userId, token, { password, passwordConfirm, recaptchaToken: reCaptchaToken });
            setSubmitted(true);
            setTimeout(() => navigate(PATH_AUTH_LOGIN, { replace: true }), 3000);
        } catch {
            setError("Reset failed. The link may have expired.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center">
            <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Reset Password
                </Typography>
                {submitted ? (
                    <Alert severity="success">Password reset! Redirecting to login...</Alert>
                ) : (
                    <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
                        <NewPasswordWithPasswordRepeatField
                            customClassesForNewPassword="w-100"
                            customClassesForPasswordRepeat="w-100"
                            passwordValue={password}
                            passwordRepeatValue={passwordConfirm}
                            onChangePassword={setPassword}
                            onChangePasswordConfirm={setPasswordConfirm}
                            onValidate={setIsValid}
                        />
                        <RecaptchaField
                            onValidate={setIsValidReCaptchaToken}
                            setReturnToken={setReCaptchaToken}
                            customClasses="w-100"
                        />
                        <Button type="submit" variant="contained" fullWidth disabled={!canSubmit}>
                            Reset Password
                        </Button>
                        {error && <Alert severity="warning">{error}</Alert>}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default ResetPasswordFormComponent;