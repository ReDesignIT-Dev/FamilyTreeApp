import UsernameField from "@/components/auth/fields/UsernameField";
import EmailField from "@/components/auth/fields/EmailField";
import NewPasswordWithPasswordRepeatField from "@/components/auth/fields/NewPasswordWithPasswordRepeatField";
import RecaptchaField from "@/components/auth/fields/RecaptchaField";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Loading from "@/components/common/Loading";
import { registerUser } from "@/services/auth/apiRequestsUser";
import { GeneralApiError, MultipleFieldErrors } from "@/services/CustomErrors";
import { useAuth } from "@/hooks/useAuth";
import { Alert, Box, Button, Paper, Typography } from "@mui/material";

const RegisterFormComponent: React.FC = () => {
    const [isValid, setIsValid] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [isUsernameValid, setIsUsernameValid] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
    const [reCaptchaToken, setReCaptchaToken] = useState<string | null>(null);
    const [isValidReCaptchaToken, setIsValidRecaptchaToken] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [passwordConfirm, setPasswordConfirm] = useState<string>("");
    const [isPasswordWithPasswordConfirmValid, setIsPasswordWithPasswordConfirmValid] =
        useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [registrationSuccessful, setRegistrationSuccessful] = useState<boolean>(false);
    const [usernameServerError, setUsernameServerError] = useState<string>("");
    const [emailServerError, setEmailServerError] = useState<string>("");

    const { isLoggedIn } = useAuth();

    useEffect(() => {
        if (isLoggedIn) {
            setEmail("");
            setUsername("");
        }
    }, [isLoggedIn]);

    useEffect(() => {
        setIsValid(
            isEmailValid && isValidReCaptchaToken && isPasswordWithPasswordConfirmValid && isUsernameValid
        );
    }, [isEmailValid, isValidReCaptchaToken, isPasswordWithPasswordConfirmValid, isUsernameValid]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!isValid) {
            setErrorMessage("Please fix the errors above before submitting.");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            const response = await registerUser({
                username,
                email,
                password,
                passwordConfirm,
                recaptchaToken: reCaptchaToken,
            });

            if (response?.status === 200) {
                setRegistrationSuccessful(true);
            } else {
                setErrorMessage(response?.data?.message ?? "Registration failed. Please try again.");
            }
        } catch (error) {
            if (error instanceof MultipleFieldErrors) {
                error.errors.forEach((err) => {
                    if (err.field === "username") setUsernameServerError(err.message);
                    if (err.field === "email") setEmailServerError(err.message);  
                    if (err.field === "detail") setErrorMessage(err.message);
                });
            } else if (error instanceof GeneralApiError) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center">
            {loading ? (
                <Loading />
            ) : isLoggedIn ? (
                <Alert severity="info">You are already logged in. Log out to register.</Alert>
            ) : registrationSuccessful ? (
                <Alert severity="success">
                    <Typography variant="subtitle1" fontWeight="bold">
                        Successful registration, check your email
                    </Typography>
                    Please check your email inbox for activation instructions.
                </Alert>
            ) : (
                <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
                    <Typography variant="h5" align="center" gutterBottom>
                        Create Account
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
                            <UsernameField
                                value={username}
                                customClasses="w-100"
                                onChange={(val) => { setUsername(val); setUsernameServerError(""); }} // ← clear on new input
                                onValidate={setIsUsernameValid}
                                disabled={false}
                                externalError={usernameServerError}
                            />
                        </Box>
                        <Box width="100%">
                            <EmailField
                                value={email}
                                onChange={(val) => { setEmail(val); setEmailServerError(""); }}       // ← clear on new input
                                onValidate={setIsEmailValid}
                                disabled={false}
                                externalError={emailServerError}
                            />
                        </Box>
                        <Box width="100%">
                            <NewPasswordWithPasswordRepeatField
                                customClassesForNewPassword="w-100"
                                customClassesForPasswordRepeat="w-100"
                                passwordValue={password}
                                passwordRepeatValue={passwordConfirm}
                                onChangePassword={setPassword}
                                onChangePasswordConfirm={setPasswordConfirm}
                                onValidate={setIsPasswordWithPasswordConfirmValid}
                            />
                        </Box>
                        <RecaptchaField
                            customClasses=""
                            onValidate={setIsValidRecaptchaToken}
                            setReturnToken={setReCaptchaToken}
                        />
                        <Button type="submit" variant="contained" fullWidth disabled={!isValid}>
                            Submit
                        </Button>
                        {errorMessage && (
                            <Alert severity="warning" sx={{ width: "100%" }}>{errorMessage}</Alert>
                        )}
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default RegisterFormComponent;