import EmailField from "@/components/auth/fields/EmailField";
import PasswordField from "@/components/auth/fields/PasswordField";
import RecaptchaField from "@/components/auth/fields/RecaptchaField";
import Loading from "@/components/common/Loading";
import { useLoginRedirect } from '@/hooks/useLoginRedirect';
import { loginUser } from "@/reduxComponents/reduxUser/Auth/authReducer";
import type { AppDispatch, RootState } from "@/reduxComponents/store";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./LoginFormComponent.css";
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
        <div>
            {isLoading ? (
                <Loading />
            ) : isLoggedIn ? (
                <label className="alert alert-success">
                    {"Login successful! Redirecting..."}
                </label>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="login-form-custom d-flex flex-column justify-content-center align-items-center mx-auto"
                >
                    <div className="input-group-login">
                        <EmailField
                            value={email}
                            onChange={setEmail}
                            onValidate={setIsEmailValid}
                            disabled={false}
                        />
                    </div>
                    <div className="input-group-login">
                        <PasswordField
                            customClasses="w-100"
                            value={password}
                            onChange={setPassword}
                            onValidate={setIsPasswordValid}
                        />
                    </div>
                    <RecaptchaField
                        onValidate={setIsValidRecaptchaToken}
                        setReturnToken={setReCaptchaToken}
                        customClasses="w-100"
                    />
                    <button type="submit" className="btn btn-primary mt-3" disabled={!isValid}>
                        Submit
                    </button>
                    {error && <label className="alert alert-warning">{error}</label>}
                </form>
            )}
        </div>
    );
};

export default LoginFormComponent;