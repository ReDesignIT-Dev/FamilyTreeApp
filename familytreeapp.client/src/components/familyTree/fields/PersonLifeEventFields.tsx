import { Box, TextField } from '@mui/material';

type PersonLifeEventKey = 'birthDate' | 'birthPlace' | 'deathDate' | 'deathPlace';

interface Props {
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  onChange: (key: PersonLifeEventKey, value: string) => void;
}

export default function PersonLifeEventFields({
  birthDate, birthPlace, deathDate, deathPlace, onChange,
}: Readonly<Props>) {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" gap={2}>
        <TextField
          label="Birth Date"
          type="date"
          value={birthDate ?? ''}
          onChange={(e) => onChange('birthDate', e.target.value)}
          fullWidth
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Birth Place"
          value={birthPlace ?? ''}
          onChange={(e) => onChange('birthPlace', e.target.value)}
          fullWidth
          size="small"
        />
      </Box>
      <Box display="flex" gap={2}>
        <TextField
          label="Death Date"
          type="date"
          value={deathDate ?? ''}
          onChange={(e) => onChange('deathDate', e.target.value)}
          fullWidth
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Death Place"
          value={deathPlace ?? ''}
          onChange={(e) => onChange('deathPlace', e.target.value)}
          fullWidth
          size="small"
        />
      </Box>
    </Box>
  );
}