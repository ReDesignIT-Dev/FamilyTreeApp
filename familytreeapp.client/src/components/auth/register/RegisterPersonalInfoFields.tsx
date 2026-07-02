import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from "@mui/material";
import type { PersonalInfoField } from "./useRegisterForm";

interface Props {
    firstName: string;
    onFirstNameChange: (v: string) => void;
    lastName: string;
    onLastNameChange: (v: string) => void;
    gender: "Male" | "Female";
    onGenderChange: (v: "Male" | "Female") => void;
    dateOfBirth: string;
    onDateOfBirthChange: (v: string) => void;
    onBlur: (field: PersonalInfoField) => void;
    showError: (field: PersonalInfoField, isEmpty: boolean) => boolean;
}

export default function RegisterPersonalInfoFields({
    firstName, onFirstNameChange,
    lastName, onLastNameChange,
    gender, onGenderChange,
    dateOfBirth, onDateOfBirthChange,
    onBlur, showError,
}: Props) {
    return (
        <>
            <Box width="100%" display="flex" gap={1}>
                <TextField
                    label="First Name"
                    value={firstName}
                    onChange={(e) => onFirstNameChange(e.target.value)}
                    onBlur={() => onBlur("firstName")}
                    required
                    fullWidth
                    size="small"
                    error={showError("firstName", firstName.trim().length === 0)}
                    helperText={showError("firstName", firstName.trim().length === 0) ? "First name is required" : ""}
                />
                <TextField
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => onLastNameChange(e.target.value)}
                    onBlur={() => onBlur("lastName")}
                    required
                    fullWidth
                    size="small"
                    error={showError("lastName", lastName.trim().length === 0)}
                    helperText={showError("lastName", lastName.trim().length === 0) ? "Last name is required" : ""}
                />
            </Box>

            <Box width="100%">
                <FormControl>
                    <FormLabel>Gender</FormLabel>
                    <RadioGroup
                        row
                        value={gender}
                        onChange={(e) => onGenderChange(e.target.value as "Male" | "Female")}
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
                    onChange={(e) => onDateOfBirthChange(e.target.value)}
                    onBlur={() => onBlur("dateOfBirth")}
                    required
                    fullWidth
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={showError("dateOfBirth", dateOfBirth.trim().length === 0)}
                    helperText={showError("dateOfBirth", dateOfBirth.trim().length === 0) ? "Date of birth is required" : ""}
                />
            </Box>
        </>
    );
}