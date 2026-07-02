import { TextField } from '@mui/material';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const MAX_LENGTH = 5000;

export default function PersonBiographyField({ value, onChange }: Props) {
  return (
    <TextField
      label="Biography"
      multiline
      rows={4}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      size="small"
      slotProps={{ htmlInput: { maxLength: MAX_LENGTH } }}
      helperText={`${value.length} / ${MAX_LENGTH}`}
    />
  );
}