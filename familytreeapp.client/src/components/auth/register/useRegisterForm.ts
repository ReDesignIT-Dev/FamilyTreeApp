import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { registerUser } from "@/services/auth/apiRequestsUser";
import { GeneralApiError, MultipleFieldErrors } from "@/services/CustomErrors";

export type PersonalInfoField = "firstName" | "lastName" | "dateOfBirth";

export function useRegisterForm() {
    const [isValid, setIsValid] = useState(false);

    const [email, setEmail] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [emailServerError, setEmailServerError] = useState("");

    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [isPasswordWithPasswordConfirmValid, setIsPasswordWithPasswordConfirmValid] = useState(false);

    const [reCaptchaToken, setReCaptchaToken] = useState<string | null>(null);
    const [isValidReCaptchaToken, setIsValidReCaptchaToken] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState<"Male" | "Female">("Male");
    const [dateOfBirth, setDateOfBirth] = useState("");

    const [touched, setTouched] = useState<Record<PersonalInfoField, boolean>>({
        firstName: false,
        lastName: false,
        dateOfBirth: false,
    });
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const [loading, setLoading] = useState(false);
    const [registrationSuccessful, setRegistrationSuccessful] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const isPersonalInfoValid =
        firstName.trim().length > 0 &&
        lastName.trim().length > 0 &&
        dateOfBirth.trim().length > 0;

    useEffect(() => {
        setIsValid(
            isEmailValid &&
            isValidReCaptchaToken &&
            isPasswordWithPasswordConfirmValid &&
            isPersonalInfoValid
        );
    }, [isEmailValid, isValidReCaptchaToken, isPasswordWithPasswordConfirmValid, isPersonalInfoValid]);

    const handleBlur = (field: PersonalInfoField) =>
        setTouched((prev) => ({ ...prev, [field]: true }));

    const showError = (field: PersonalInfoField, isEmpty: boolean): boolean =>
        (touched[field] || submitAttempted) && isEmpty;

    const handleEmailChange = (val: string) => {
        setEmail(val);
        setEmailServerError("");
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitAttempted(true);

        if (!isValid) return;

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

    return {
        // personal info
        firstName, setFirstName,
        lastName, setLastName,
        gender, setGender,
        dateOfBirth, setDateOfBirth,
        // credentials
        email, handleEmailChange, emailServerError,
        password, setPassword,
        passwordConfirm, setPasswordConfirm,
        // child-field validation callbacks
        setIsEmailValid,
        setIsPasswordWithPasswordConfirmValid,
        setIsValidReCaptchaToken,
        setReCaptchaToken,
        // form status
        loading,
        registrationSuccessful,
        errorMessage,
        // touched / validation helpers
        handleBlur,
        showError,
        // submit
        handleSubmit,
    };
}