import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { TextField, Box } from "@mui/material";
import { FIELD_LIMITS } from "@/constants/validation";

interface UsernameFieldProps {
    value: string;
    disabled: boolean;
    customClasses: string;
    onChange: (value: string) => void;
    onValidate: (isValid: boolean) => void;
    externalError?: string;
}

const UsernameField: React.FC<UsernameFieldProps> = ({
    value,
    disabled,
    customClasses,
    onChange,
    onValidate,
    externalError
}) => {
    const [username, setUsername] = useState<string>("");
    const [touched, setTouched] = useState<boolean>(false);

    const isValid = username.length >= FIELD_LIMITS.USERNAME_MIN && username.length <= FIELD_LIMITS.USERNAME_MAX;
    const showError = (touched && !isValid) || !!externalError;
    const errorText = externalError
        ? externalError
        : `Username must be between ${FIELD_LIMITS.USERNAME_MIN} and ${FIELD_LIMITS.USERNAME_MAX} characters`;

    useEffect(() => {
        setUsername(value);
    }, [value]);

    useEffect(() => {
        onValidate(isValid);
    }, [username, onValidate]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setUsername(val);
        onChange(val);
    };

    return (
        <Box className={customClasses}>
            <TextField
                label="Username"
                type="text"
                id="usernameField"
                value={username}
                onChange={handleChange}
                onBlur={() => setTouched(true)}
                placeholder="username"
                disabled={disabled}
                fullWidth
                variant="outlined"
                size="small"
                error={showError}
                helperText={showError ? errorText : ""}
                sx={{ '& .MuiInputBase-input': { textAlign: 'center' } }}
            />
        </Box>
    );
};

export default UsernameField;
