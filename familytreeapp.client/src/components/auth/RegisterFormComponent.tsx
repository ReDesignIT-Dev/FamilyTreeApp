import EmailField from "@/components/auth/fields/EmailField";
import NewPasswordWithPasswordRepeatField from "@/components/auth/fields/NewPasswordWithPasswordRepeatField";
import RecaptchaField from "@/components/auth/fields/RecaptchaField";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Loading from "@/components/common/Loading";
import { registerUser } from "@/services/auth/apiRequestsUser";
import { GeneralApiError, MultipleFieldErrors } from "@/services/CustomErrors";
import { useAuth } from "@/hooks/useAuth";
import {
    Alert,
    Box,
    Button,
    FormControl,
    FormControlLabel,
    FormLabel,
    Paper,
    Radio,
    RadioGroup,
    TextField,
    Typography,
} from "@mui/material";

const RegisterFormComponent: React.FC = () => {
    const [isValid, setIsValid] = useState<boolean>(false);
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
    const [emailServerError, setEmailServerError] = useState<string>("");

    // New fields
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [gender, setGender] = useState<"Male" | "Female">("Male");
    const [dateOfBirth, setDateOfBirth] = useState<string>("");

    const { isLoggedIn } = useAuth();

    useEffect(() => {
        if (isLoggedIn) {
            setEmail("");
        }
    }, [isLoggedIn]);

    const isNewFieldsValid =
        firstName.trim().length > 0 &&
        lastName.trim().length > 0 &&
        dateOfBirth.trim().length > 0;

    useEffect(() => {
        setIsValid(
            isEmailValid &&
            isValidReCaptchaToken &&
            isPasswordWithPasswordConfirmValid &&
            isNewFieldsValid
        );
    }, [isEmailValid, isValidReCaptchaToken, isPasswordWithPasswordConfirmValid, isNewFieldsValid]);

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
                email,
                password,
                passwordConfirm,
                recaptchaToken: reCaptchaToken,
                firstName,
                lastName,
                gender,
                dateOfBirth,
            });

            if (response?.status === 200) {
                setRegistrationSuccessful(true);
            } else {
                setErrorMessage(response?.data?.message ?? "Registration failed. Please try again.");
            }
        } catch (error) {
            if (error instanceof MultipleFieldErrors) {
                error.errors.forEach((err) => {
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
                        <Box width="100%" display="flex" gap={1}>
                            <TextField
                                label="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                fullWidth
                                size="small"
                                error={firstName.trim().length === 0}
                                helperText={firstName.trim().length === 0 ? "First name is required" : ""}
                            />
                            <TextField
                                label="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                fullWidth
                                size="small"
                                error={lastName.trim().length === 0}
                                helperText={lastName.trim().length === 0 ? "Last name is required" : ""}
                            />
                        </Box>
                        <Box width="100%">
                            <FormControl>
                                <FormLabel>Gender</FormLabel>
                                <RadioGroup
                                    row
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value as "Male" | "Female")}
                                >
                                    <FormControlLabel value="Male" control={<Radio />} label="Male" />
                                    <FormControlLabel value="Female" control={<Radio />} label="Female" />
                                </RadioGroup>
                            </FormControl>
                        </Box>
                        <Box width="100%">
                            <TextField
                                label="Date of Birth"
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                required
                                fullWidth
                                size="small"
                                slotProps={{ inputLabel: { shrink: true } }}
                                error={dateOfBirth.trim().length === 0}
                                helperText={dateOfBirth.trim().length === 0 ? "Date of birth is required" : ""}
                            />
                        </Box>
                       
                        <Box width="100%">
                            <EmailField
                                value={email}
                                onChange={(val) => { setEmail(val); setEmailServerError(""); }}
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