import EmailField from "@/components/auth/fields/EmailField";
import PasswordField from "@/components/auth/fields/PasswordField";
import RecaptchaField from "@/components/auth/fields/RecaptchaField";
import Loading from "@/components/common/Loading";
import { useLoginRedirect } from '@/hooks/useLoginRedirect';
import { loginUser } from "@/reduxComponents/reduxUser/Auth/authReducer";
import type { AppDispatch, RootState } from "@/reduxComponents/store";
import { Alert, Box, Button, Link, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import type { FormEvent } from "react";
import { PATH_AUTH_PASSWORD_RECOVERY } from "@/router/routes";

const LoginFormComponent: React.FC = () => {
    const [isValid, setIsValid] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
    const [reCaptchaToken, setReCaptchaToken] = useState<string | null>(null);
    const [isValidReCaptchaToken, setIsValidRecaptchaToken] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);

    const { isLoggedIn, isLoading, error } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();

    useLoginRedirect();

    useEffect(() => {
        const valid = isEmailValid && isValidReCaptchaToken && isPasswordValid;
        setIsValid(valid);
    }, [isEmailValid, isValidReCaptchaToken, isPasswordValid]);

    useEffect(() => {
        if (isLoggedIn) {
            setEmail("");
            setPassword("");
            setReCaptchaToken(null);
            setIsEmailValid(false);
            setIsPasswordValid(false);
            setIsValidRecaptchaToken(false);
            setIsValid(false);
        }
    }, [isLoggedIn]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (isValid) {
            dispatch(loginUser({ email, password, recaptchaToken: reCaptchaToken }));
        }
    };

    if (isLoading) return <Loading />;

    if (isLoggedIn) {
        return (
            <Alert severity="success">Login successful! Redirecting...</Alert>
        );
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            display="flex"
            flexDirection="column"
            gap={2}
        >
            <Box>
                <EmailField
                    value={email}
                    onChange={setEmail}
                    onValidate={setIsEmailValid}
                    disabled={false}
                />
            </Box>
            <Box>
                <PasswordField
                    customClasses="w-100"
                    value={password}
                    onChange={setPassword}
                    onValidate={setIsPasswordValid}
                />
            </Box>
            <RecaptchaField
                onValidate={setIsValidRecaptchaToken}
                setReturnToken={setReCaptchaToken}
                customClasses="w-100"
            />
            <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!isValid}
                size="large"
                sx={{ mt: 1 }}
            >
                Sign In
            </Button>
            <Box textAlign="center">
                <Link component={RouterLink} to={PATH_AUTH_PASSWORD_RECOVERY} variant="body2" color="primary">
                    Forgot your password?
                </Link>
            </Box>
            {error && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                    <Typography variant="body2">{error}</Typography>
                </Alert>
            )}
        </Box>
    );
};

export default LoginFormComponent;