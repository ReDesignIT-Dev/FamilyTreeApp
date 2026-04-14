import EmailField from "@/components/auth/fields/EmailField";
import PasswordField from "@/components/auth/fields/PasswordField";
import RecaptchaField from "@/components/auth/fields/RecaptchaField";
import Loading from "@/components/common/Loading";
import { useLoginRedirect } from '@/hooks/useLoginRedirect';
import { loginUser } from "@/reduxComponents/reduxUser/Auth/authReducer";
import type { AppDispatch, RootState } from "@/reduxComponents/store";
import { Alert, Box, Button, Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { FormEvent } from "react";

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

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (isValid) {
            dispatch(loginUser({ username: email, password, recaptchaToken: reCaptchaToken }));
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center">
            {isLoading ? (
                <Loading />
            ) : isLoggedIn ? (
                <Alert severity="success">Login successful! Redirecting...</Alert>
            ) : (
                <Paper
                    elevation={3}
                    sx={{ p: 4, width: "100%", maxWidth: 400 }}
                >
                    <Typography variant="h5" align="center" gutterBottom>
                        Sign In
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        gap={2}
                    >
                        <Box width="100%">
                            <EmailField
                                value={email}
                                onChange={setEmail}
                                onValidate={setIsEmailValid}
                                disabled={false}
                            />
                        </Box>
                        <Box width="100%">
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
                        >
                            Submit
                        </Button>
                        {error && <Alert severity="warning" sx={{ width: "100%" }}>{error}</Alert>}
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default LoginFormComponent;