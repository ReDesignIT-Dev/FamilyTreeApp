import { Alert, Box, Button, Paper, Typography } from "@mui/material";
import EmailField from "@/components/auth/fields/EmailField";
import NewPasswordWithPasswordRepeatField from "@/components/auth/fields/NewPasswordWithPasswordRepeatField";
import RecaptchaField from "@/components/auth/fields/RecaptchaField";
import Loading from "@/components/common/Loading";
import RegisterPersonalInfoFields from "./register/RegisterPersonalInfoFields";
import { useRegisterForm } from "./register/useRegisterForm";

const RegisterFormComponent: React.FC = () => {
    const {
        firstName, setFirstName,
        lastName, setLastName,
        gender, setGender,
        dateOfBirth, setDateOfBirth,
        email, handleEmailChange, emailServerError,
        password, setPassword,
        passwordConfirm, setPasswordConfirm,
        setIsEmailValid,
        setIsPasswordWithPasswordConfirmValid,
        setReCaptchaToken,
        setIsValidReCaptchaToken,
        loading,
        registrationSuccessful,
        errorMessage,
        handleBlur,
        showError,
        handleSubmit,
    } = useRegisterForm();

    if (loading) return <Loading />;

    if (registrationSuccessful) {
        return (
            <Alert severity="success">
                <Typography variant="subtitle1" fontWeight="bold">
                    Successful registration, check your email
                </Typography>
                Please check your email inbox for activation instructions.
            </Alert>
        );
    }

    return (
        <Box display="flex" justifyContent="center" alignItems="center">
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
                    <RegisterPersonalInfoFields
                        firstName={firstName}       onFirstNameChange={setFirstName}
                        lastName={lastName}         onLastNameChange={setLastName}
                        gender={gender}             onGenderChange={setGender}
                        dateOfBirth={dateOfBirth}   onDateOfBirthChange={setDateOfBirth}
                        onBlur={handleBlur}
                        showError={showError}
                    />
                    <Box width="100%">
                        <EmailField
                            value={email}
                            onChange={handleEmailChange}
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
                        onValidate={setIsValidReCaptchaToken}
                        setReturnToken={setReCaptchaToken}
                    />
                    <Button type="submit" variant="contained" fullWidth>
                        Submit
                    </Button>
                    {errorMessage && (
                        <Alert severity="warning" sx={{ width: "100%" }}>
                            {errorMessage}
                        </Alert>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default RegisterFormComponent;