import { Box, TextField } from '@mui/material';
import type { AddMemberField } from '@/hooks/useAddMemberForm';

type PersonNameKey = 'firstName' | 'middleName' | 'lastName' | 'maidenName';

interface Props {
    firstName: string;
    middleName?: string;
    lastName: string;
    maidenName?: string;
    onChange: (key: PersonNameKey, value: string) => void;
    onBlur: (field: AddMemberField) => void;
    showError: (field: AddMemberField, isEmpty: boolean) => boolean;
}

export default function PersonNameFields({
    firstName, middleName, lastName, maidenName, onChange, onBlur, showError,
}: Readonly<Props>) {
    return (
        <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" gap={2}>
                <TextField
                    label="First Name"
                    value={firstName}
                    onChange={(e) => onChange('firstName', e.target.value)}
                    onBlur={() => onBlur('firstName')}
                    required
                    fullWidth
                    size="small"
                    error={showError('firstName', firstName.trim().length === 0)}
                    helperText={showError('firstName', firstName.trim().length === 0) ? 'First name is required' : ''}
                />
                <TextField
                    label="Middle Name"
                    value={middleName ?? ''}
                    onChange={(e) => onChange('middleName', e.target.value)}
                    fullWidth
                    size="small"
                />
            </Box>
            <Box display="flex" gap={2}>
                <TextField
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => onChange('lastName', e.target.value)}
                    onBlur={() => onBlur('lastName')}
                    required
                    fullWidth
                    size="small"
                    error={showError('lastName', lastName.trim().length === 0)}
                    helperText={showError('lastName', lastName.trim().length === 0) ? 'Last name is required' : ''}
                />
                <TextField
                    label="Maiden Name"
                    value={maidenName ?? ''}
                    onChange={(e) => onChange('maidenName', e.target.value)}
                    fullWidth
                    size="small"
                />
            </Box>
        </Box>
    );
}