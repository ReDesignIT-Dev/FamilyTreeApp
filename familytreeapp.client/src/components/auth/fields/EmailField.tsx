import { isEmailValid } from "@/utils/validation";
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { TextField, Box } from "@mui/material";

interface EmailFieldProps {
    value: string;
    disabled: boolean;
    onChange: (value: string) => void;
    onValidate: (isValid: boolean) => void;
    externalError?: string;
}

const EmailField: React.FC<EmailFieldProps> = ({ value, disabled, onChange, onValidate, externalError }) => {
    const [touched, setTouched] = useState<boolean>(false);

    const valid = isEmailValid(value);
    const showError = (touched && !valid) || !!externalError;
    const errorText = externalError ? externalError : "Please enter a valid email address";

    useEffect(() => {
        onValidate(valid);
    }, [value, onValidate]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <Box>
            <TextField
                label="Email"
                type="email"
                id="emailField"
                value={value}
                onChange={handleChange}
                onBlur={() => setTouched(true)}
                placeholder="email"
                autoComplete="email"
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

export default EmailField;