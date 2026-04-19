import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";

import {
    isPasswordValid,
    isLengthValid,
    isDigitValid,
    isLowercaseValid,
    isSpecialCharValid,
    isUppercaseValid,
} from "@/utils/validation";
import {
    TextField,
    Typography,
    IconButton,
    InputAdornment,
    Box,
    Stack
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { PASSWORD_RULES, type PasswordRules } from "@/config";

interface NewPasswordFieldProps {
    value: string;
    customClasses: string;
    onChange: (value: string) => void;
    onValidate: (isValid: boolean) => void;
    rules?: PasswordRules;
}

const NewPasswordField: React.FC<NewPasswordFieldProps> = ({
    value, customClasses, onChange, onValidate, rules = PASSWORD_RULES
}) => {
    const [newPassword, setNewPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [touched, setTouched] = useState<boolean>(false);

    useEffect(() => {
        onValidate(isPasswordValid(newPassword, rules));
    }, [newPassword, onValidate, rules]);

    useEffect(() => {
        setNewPassword(value);
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setNewPassword(val);
        onChange(val);
    };

    const handleBlur = () => setTouched(true);

    const getRequirementColor = (met: boolean) => {
        if (!touched && !newPassword) return "text.secondary";
        if (met) return "success.main";
        if (touched) return "error.main";
        return "warning.main";
    };

    const requirements = [
        {
            label: `Minimum length - ${rules.minLength} characters`,
            met: isLengthValid(newPassword, rules.minLength),
        },
        rules.requireUppercase && {
            label: "At least one uppercase letter",
            met: isUppercaseValid(newPassword),
        },
        rules.requireLowercase && {
            label: "At least one lowercase letter",
            met: isLowercaseValid(newPassword),
        },
        rules.requireDigit && {
            label: "At least one numeric digit",
            met: isDigitValid(newPassword),
        },
        rules.requireSpecialChar && {
            label: "At least one special character",
            met: isSpecialCharValid(newPassword),
        },
    ].filter(Boolean) as { label: string; met: boolean }[];

    return (
        <Box className={`d-flex flex-column ${customClasses}`}>
            <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                id="newPasswordField"
                value={newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="password"
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{ '& .MuiInputBase-input': { textAlign: 'center' } }}
            />

            <Stack spacing={0.5} alignItems="center" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                    Password Requirements:
                </Typography>
                {requirements.map((req) => (
                    <Typography
                        key={req.label}
                        variant="body2"
                        sx={{ fontSize: '0.8rem', color: getRequirementColor(req.met) }}
                    >
                        {req.label}
                    </Typography>
                ))}
            </Stack>
        </Box>
    );
};

export default NewPasswordField;