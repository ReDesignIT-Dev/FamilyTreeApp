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
  const [usernameFieldError, setUsernameFieldError] = useState<string>("");
  const [isUsernameValid, setIsUsernameValid] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [emailFieldError, setEmailFieldError] = useState<string>("");
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

  const isLoggedIn = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      setEmail("");
      setUsername("");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isUsernameValid) {
      setUsernameFieldError("Username must be between 3 and 30 chars");
    } else {
      setUsernameFieldError("");
    }
  }, [username, isUsernameValid]);

  useEffect(() => {
    if (!isEmailValid) {
      setEmailFieldError("Invalid email");
    } else {
      setEmailFieldError("");
    }
  }, [email, isEmailValid]);

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
          if (err.field === "username") setUsernameFieldError(err.message);
          if (err.field === "email") setEmailFieldError(err.message);
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
                onChange={setUsername}
                onValidate={setIsUsernameValid}
                disabled={false}
              />
              {usernameFieldError && (
                <Alert severity="error" sx={{ mt: 0.5 }}>{usernameFieldError}</Alert>
              )}
            </Box>
            <Box width="100%">
              <EmailField
                value={email}
                onChange={setEmail}
                onValidate={setIsEmailValid}
                disabled={false}
              />
              {emailFieldError && (
                <Alert severity="error" sx={{ mt: 0.5 }}>{emailFieldError}</Alert>
              )}
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