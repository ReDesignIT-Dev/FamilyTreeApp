import { Alert, Box, Button, Typography } from "@mui/material";
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
                <Typography variant="subtitle2" fontWeight={700}>
                    Registration successful!
                </Typography>
                Please check your email inbox for activation instructions.
            </Alert>
        );
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            display="flex"
            flexDirection="column"
            gap={2.5}
        >
            <RegisterPersonalInfoFields
                firstName={firstName}       onFirstNameChange={setFirstName}
                lastName={lastName}         onLastNameChange={setLastName}
                gender={gender}             onGenderChange={setGender}
                dateOfBirth={dateOfBirth}   onDateOfBirthChange={setDateOfBirth}
                onBlur={handleBlur}
                showError={showError}
            />
            <Box>
                <EmailField
                    value={email}
                    onChange={handleEmailChange}
                    onValidate={setIsEmailValid}
                    disabled={false}
                    externalError={emailServerError}
                />
            </Box>
            <Box>
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
            <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 1 }}>
                Create Account
            </Button>
            {errorMessage && (
                <Alert severity="warning">
                    <Typography variant="body2">{errorMessage}</Typography>
                </Alert>
            )}
        </Box>
    );
};

export default RegisterFormComponent;